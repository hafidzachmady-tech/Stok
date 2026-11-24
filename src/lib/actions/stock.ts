"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireUser } from "../auth";
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

  const sql = await getDb();
  const products = await sql<{ id: string; name: string; product_code: string; stock: number }[]>`
    select id, name, product_code, stock from products
    where id = ${productId} and deleted_at is null
  `;
  const product = products[0];
  if (!product) return { ok: false, error: "Barang tidak ditemukan atau sudah dihapus." };

  const delta = type === "masuk" ? quantity : -quantity;

  try {
    // Satu UPDATE atomik dengan pengaman stok tidak boleh negatif.
    const updated = await sql<{ stock: number }[]>`
      update products
      set stock = stock + ${delta}, updated_at = now()
      where id = ${productId} and deleted_at is null and stock + ${delta} >= 0
      returning stock
    `;

    if (!updated[0]) {
      const fresh = await sql<{ stock: number }[]>`
        select stock from products where id = ${productId}
      `;
      const available = fresh[0]?.stock ?? product.stock;
      return {
        ok: false,
        error: `Stok tidak mencukupi. Stok ${product.name} saat ini ${formatNumber(available)}.`,
      };
    }

    const stockAfter = updated[0].stock;
    const stockBefore = stockAfter - delta;

    try {
      await sql.begin(async (tx) => {
        await tx`
          insert into stock_transactions (id, product_id, product_name, product_code, transaction_type, quantity, stock_before, stock_after, note, user_id, user_name, created_at)
          values (${newId()}, ${productId}, ${product.name}, ${product.product_code}, ${type},
            ${quantity}, ${stockBefore}, ${stockAfter}, ${note || null}, ${user.id}, ${user.full_name}, now())
        `;
        await tx`
          insert into audit_logs (id, user_id, user_name, action, description, created_at)
          values (${newId()}, ${user.id}, ${user.full_name},
            ${type === "masuk" ? "stock_in" : "stock_out"},
            ${`Barang ${type} ${product.name} sebanyak ${quantity} (stok ${stockBefore} → ${stockAfter})`},
            now())
        `;
      });
    } catch (insertError) {
      // Batalkan perubahan stok agar tidak ada stok tanpa catatan transaksi.
      await sql`update products set stock = ${stockBefore}, updated_at = now() where id = ${productId}`;
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
  if (!/^\d+$/.test(newStockRaw)) {
    return { ok: false, error: "Stok baru harus berupa angka bulat tidak negatif." };
  }
  if (!note) return { ok: false, error: "Alasan koreksi wajib diisi." };
  if (note.length > 300) return { ok: false, error: "Alasan koreksi maksimal 300 karakter." };

  const newStock = Number(newStockRaw);
  if (!Number.isSafeInteger(newStock) || newStock > 10_000_000) {
    return { ok: false, error: "Stok baru tidak valid." };
  }

  const sql = await getDb();
  const rows = await sql<{ id: string; name: string; product_code: string; stock: number }[]>`
    select id, name, product_code, stock from products
    where id = ${productId} and deleted_at is null
  `;
  const product = rows[0];
  if (!product) return { ok: false, error: "Barang tidak ditemukan." };
  if (product.stock === newStock) {
    return { ok: false, error: "Stok baru sama dengan stok saat ini, tidak ada perubahan." };
  }

  const quantity = Math.abs(newStock - product.stock);

  try {
    await sql.begin(async (tx) => {
      await tx`update products set stock = ${newStock}, updated_at = now() where id = ${productId}`;
      await tx`
        insert into stock_transactions (id, product_id, product_name, product_code, transaction_type, quantity, stock_before, stock_after, note, user_id, user_name, created_at)
        values (${newId()}, ${productId}, ${product.name}, ${product.product_code}, 'koreksi',
          ${quantity}, ${product.stock}, ${newStock}, ${`Koreksi: ${note}`}, ${user.id}, ${user.full_name}, now())
      `;
      await tx`
        insert into audit_logs (id, user_id, user_name, action, description, created_at)
        values (${newId()}, ${user.id}, ${user.full_name}, 'correct_stock',
          ${`Koreksi stok ${product.name}: ${product.stock} → ${newStock}. Alasan: ${note}`}, now())
      `;
    });
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
