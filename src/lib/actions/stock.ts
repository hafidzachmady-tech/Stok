"use server";

import { revalidatePath } from "next/cache";
import { auditLog, requireAdmin, requireUser } from "../auth";
import { getDb } from "../db";
import { newId } from "../password";
import { formatNumber } from "../format";
import type { ActionResult } from "../types";
import { positiveInt, str } from "../validate";

function refreshStockViews() {
  revalidatePath("/beranda");
  revalidatePath("/barang");
  revalidatePath("/stok");
  revalidatePath("/riwayat");
  revalidatePath("/belanja");
}

export async function recordStockAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  // Admin maupun penjaga boleh mencatat transaksi stok.
  const user = await requireUser();

  const productId = str(formData, "product_id");
  const type = str(formData, "transaction_type");
  const quantity = positiveInt(formData, "quantity");
  const note = str(formData, "note").slice(0, 300);

  if (!productId) return { ok: false, error: "Pilih barang terlebih dahulu." };
  if (type !== "masuk" && type !== "keluar") {
    return { ok: false, error: "Jenis transaksi tidak valid." };
  }
  if (quantity === null) return { ok: false, error: "Jumlah harus berupa angka lebih dari nol." };
  if (quantity > 1_000_000) return { ok: false, error: "Jumlah transaksi terlalu besar." };

  const db = await getDb();
  const product = await db
    .prepare("SELECT id, name, product_code, stock FROM products WHERE id = ? AND deleted_at IS NULL")
    .bind(productId)
    .first<{ id: string; name: string; product_code: string; stock: number }>();
  if (!product) return { ok: false, error: "Barang tidak ditemukan atau sudah dihapus." };

  const nowIso = new Date().toISOString();
  const delta = type === "masuk" ? quantity : -quantity;

  try {
    // Satu pernyataan UPDATE atomik dengan pengaman stok >= jumlah keluar.
    const updated = await db
      .prepare(
        `UPDATE products
         SET stock = stock + ?, updated_at = ?
         WHERE id = ? AND deleted_at IS NULL AND stock + ? >= 0
         RETURNING stock`,
      )
      .bind(delta, nowIso, productId, delta)
      .first<{ stock: number }>();

    if (!updated) {
      const fresh = await db
        .prepare("SELECT stock FROM products WHERE id = ?")
        .bind(productId)
        .first<{ stock: number }>();
      const available = fresh?.stock ?? product.stock;
      return {
        ok: false,
        error: `Stok tidak mencukupi. Stok ${product.name} saat ini ${formatNumber(available)}.`,
      };
    }

    const stockAfter = updated.stock;
    const stockBefore = stockAfter - delta;

    try {
      await db.batch([
        db
          .prepare(
            `INSERT INTO stock_transactions (id, product_id, product_name, product_code, transaction_type, quantity, stock_before, stock_after, note, user_id, user_name, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            newId(),
            productId,
            product.name,
            product.product_code,
            type,
            quantity,
            stockBefore,
            stockAfter,
            note || null,
            user.id,
            user.full_name,
            nowIso,
          ),
        db
          .prepare(
            "INSERT INTO audit_logs (id, user_id, user_name, action, description, created_at) VALUES (?, ?, ?, ?, ?, ?)",
          )
          .bind(
            newId(),
            user.id,
            user.full_name,
            type === "masuk" ? "stock_in" : "stock_out",
            `Barang ${type} ${product.name} sebanyak ${quantity} (stok ${stockBefore} → ${stockAfter})`,
            nowIso,
          ),
      ]);
    } catch (insertError) {
      // Batalkan perubahan stok agar tidak ada stok tanpa catatan transaksi.
      await db
        .prepare("UPDATE products SET stock = ?, updated_at = ? WHERE id = ?")
        .bind(stockBefore, new Date().toISOString(), productId)
        .run();
      throw insertError;
    }

    refreshStockViews();
    return {
      ok: true,
      message: `Barang ${type} tercatat: ${product.name} ${formatNumber(quantity)}. Stok ${formatNumber(stockBefore)} → ${formatNumber(stockAfter)}.`,
    };
  } catch (error) {
    console.error("recordStockAction", error);
    return { ok: false, error: "Transaksi gagal disimpan. Periksa koneksi lalu coba lagi." };
  }
}

export async function correctStockAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  // Koreksi hanya untuk admin, selalu tercatat di riwayat sebagai audit trail.
  const user = await requireAdmin();

  const productId = str(formData, "product_id");
  const newStockRaw = str(formData, "new_stock");
  const note = str(formData, "note");

  if (!productId) return { ok: false, error: "Pilih barang yang akan dikoreksi." };
  if (!/^\d+$/.test(newStockRaw)) return { ok: false, error: "Stok baru harus berupa angka bulat tidak negatif." };
  if (!note) return { ok: false, error: "Alasan koreksi wajib diisi." };
  if (note.length > 300) return { ok: false, error: "Alasan koreksi maksimal 300 karakter." };

  const newStock = Number(newStockRaw);
  if (!Number.isSafeInteger(newStock) || newStock > 10_000_000) {
    return { ok: false, error: "Stok baru tidak valid." };
  }

  const db = await getDb();
  const product = await db
    .prepare("SELECT id, name, product_code, stock FROM products WHERE id = ? AND deleted_at IS NULL")
    .bind(productId)
    .first<{ id: string; name: string; product_code: string; stock: number }>();
  if (!product) return { ok: false, error: "Barang tidak ditemukan." };
  if (product.stock === newStock) {
    return { ok: false, error: "Stok baru sama dengan stok saat ini, tidak ada perubahan." };
  }

  const nowIso = new Date().toISOString();
  const delta = newStock - product.stock;
  const quantity = Math.abs(delta);

  try {
    await db.batch([
      db.prepare("UPDATE products SET stock = ?, updated_at = ? WHERE id = ?").bind(newStock, nowIso, productId),
      db
        .prepare(
          `INSERT INTO stock_transactions (id, product_id, product_name, product_code, transaction_type, quantity, stock_before, stock_after, note, user_id, user_name, created_at)
           VALUES (?, ?, ?, ?, 'koreksi', ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          newId(),
          productId,
          product.name,
          product.product_code,
          quantity,
          product.stock,
          newStock,
          `Koreksi: ${note}`,
          user.id,
          user.full_name,
          nowIso,
        ),
      db
        .prepare(
          "INSERT INTO audit_logs (id, user_id, user_name, action, description, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        )
        .bind(
          newId(),
          user.id,
          user.full_name,
          "correct_stock",
          `Koreksi stok ${product.name}: ${product.stock} → ${newStock}. Alasan: ${note}`,
          nowIso,
        ),
    ]);
    refreshStockViews();
    return {
      ok: true,
      message: `Koreksi tersimpan: ${product.name} ${formatNumber(product.stock)} → ${formatNumber(newStock)}.`,
    };
  } catch (error) {
    console.error("correctStockAction", error);
    return { ok: false, error: "Koreksi gagal disimpan. Coba lagi." };
  }
}
