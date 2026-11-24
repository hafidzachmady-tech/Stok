"use server";

import { revalidatePath } from "next/cache";
import { auditLog, requireAdmin, requireUser } from "../auth";
import { getDb } from "../db";
import { newId } from "../password";
import { formatRupiah } from "../format";
import type { ActionResult } from "../types";
import { nonNegativeInt, str } from "../validate";

function refreshProductViews() {
  revalidatePath("/barang");
  revalidatePath("/beranda");
  revalidatePath("/belanja");
  revalidatePath("/stok");
  revalidatePath("/riwayat");
  revalidatePath("/pengaturan");
}

type ProductInput = {
  productCode: string;
  name: string;
  category: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minimumStock: number;
};

function readInput(formData: FormData): { data: ProductInput } | { error: string } {
  const productCode = str(formData, "product_code");
  const name = str(formData, "name");
  const category = str(formData, "category") || "Lainnya";
  const unit = str(formData, "unit") || "pcs";

  if (!productCode) return { error: "Kode barang wajib diisi." };
  if (productCode.length > 30) return { error: "Kode barang maksimal 30 karakter." };
  if (!/^[A-Za-z0-9._-]+$/.test(productCode)) {
    return { error: "Kode barang hanya boleh berisi huruf, angka, titik, garis bawah, atau strip." };
  }
  if (!name) return { error: "Nama barang wajib diisi." };
  if (name.length > 120) return { error: "Nama barang maksimal 120 karakter." };
  if (category.length > 60) return { error: "Kategori maksimal 60 karakter." };
  if (unit.length > 20) return { error: "Satuan maksimal 20 karakter." };

  const purchasePrice = nonNegativeInt(formData, "purchase_price");
  const sellingPrice = nonNegativeInt(formData, "selling_price");
  const stock = nonNegativeInt(formData, "stock");
  const minimumStock = nonNegativeInt(formData, "minimum_stock");

  if (purchasePrice === null) return { error: "Harga beli harus berupa angka bulat dan tidak boleh negatif." };
  if (sellingPrice === null) return { error: "Harga jual harus berupa angka bulat dan tidak boleh negatif." };
  if (stock === null) return { error: "Jumlah stok harus berupa angka bulat dan tidak boleh negatif." };
  if (minimumStock === null) return { error: "Batas minimum stok harus berupa angka bulat dan tidak boleh negatif." };
  if (purchasePrice > 1_000_000_000) return { error: "Harga beli terlalu besar." };
  if (sellingPrice > 1_000_000_000) return { error: "Harga jual terlalu besar." };
  if (stock > 10_000_000) return { error: "Jumlah stok terlalu besar." };
  if (minimumStock > 10_000_000) return { error: "Batas minimum stok terlalu besar." };

  return {
    data: { productCode, name, category, unit, purchasePrice, sellingPrice, stock, minimumStock },
  };
}

async function assertCodeUnique(code: string, exceptId?: string): Promise<string | null> {
  const db = await getDb();
  const existing = await db
    .prepare("SELECT id FROM products WHERE product_code = ? COLLATE NOCASE")
    .bind(code)
    .first<{ id: string }>();
  if (existing && existing.id !== exceptId) {
    return `Kode barang "${code}" sudah digunakan. Gunakan kode lain.`;
  }
  return null;
}

export async function saveProductAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireAdmin();
  const id = str(formData, "id");
  const parsed = readInput(formData);
  if ("error" in parsed) return { ok: false, error: parsed.error };
  const { data } = parsed;

  const duplicate = await assertCodeUnique(data.productCode, id || undefined);
  if (duplicate) return { ok: false, error: duplicate };

  const db = await getDb();
  const nowIso = new Date().toISOString();

  try {
    if (id) {
      const existing = await db
        .prepare("SELECT id, name FROM products WHERE id = ? AND deleted_at IS NULL")
        .bind(id)
        .first<{ id: string; name: string }>();
      if (!existing) return { ok: false, error: "Barang tidak ditemukan atau sudah dihapus." };

      await db
        .prepare(
          `UPDATE products SET product_code = ?, name = ?, category = ?, unit = ?,
             purchase_price = ?, selling_price = ?, minimum_stock = ?, updated_at = ?
           WHERE id = ?`,
        )
        .bind(
          data.productCode,
          data.name,
          data.category,
          data.unit,
          data.purchasePrice,
          data.sellingPrice,
          data.minimumStock,
          nowIso,
          id,
        )
        .run();

      await auditLog(
        db,
        user.id,
        user.full_name,
        "update_product",
        `Mengubah data barang ${data.name} (${data.productCode})`,
      );
      refreshProductViews();
      return { ok: true, message: `Barang "${data.name}" berhasil diperbarui.` };
    }

    const productId = newId();
    const statements = [
      db
        .prepare(
          `INSERT INTO products (id, product_code, name, category, unit, purchase_price, selling_price, stock, minimum_stock, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          productId,
          data.productCode,
          data.name,
          data.category,
          data.unit,
          data.purchasePrice,
          data.sellingPrice,
          data.stock,
          data.minimumStock,
          nowIso,
          nowIso,
        ),
    ];

    if (data.stock > 0) {
      statements.push(
        db
          .prepare(
            `INSERT INTO stock_transactions (id, product_id, product_name, product_code, transaction_type, quantity, stock_before, stock_after, note, user_id, user_name, created_at)
             VALUES (?, ?, ?, ?, 'masuk', ?, 0, ?, ?, ?, ?, ?)`,
          )
          .bind(
            newId(),
            productId,
            data.name,
            data.productCode,
            data.stock,
            data.stock,
            "Stok awal barang baru",
            user.id,
            user.full_name,
            nowIso,
          ),
      );
    }

    statements.push(
      db
        .prepare(
          "INSERT INTO audit_logs (id, user_id, user_name, action, description, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        )
        .bind(
          newId(),
          user.id,
          user.full_name,
          "create_product",
          `Menambahkan barang ${data.name} (${data.productCode}), stok awal ${data.stock}, harga jual ${formatRupiah(data.sellingPrice)}`,
          nowIso,
        ),
    );

    await db.batch(statements);
    refreshProductViews();
    return { ok: true, message: `Barang "${data.name}" berhasil ditambahkan.` };
  } catch (error) {
    console.error("saveProductAction", error);
    return { ok: false, error: "Gagal menyimpan barang. Periksa kembali data lalu coba lagi." };
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!id) return { ok: false, error: "Barang tidak ditemukan." };

  const db = await getDb();
  const product = await db
    .prepare("SELECT id, name, product_code FROM products WHERE id = ? AND deleted_at IS NULL")
    .bind(id)
    .first<{ id: string; name: string; product_code: string }>();
  if (!product) return { ok: false, error: "Barang tidak ditemukan atau sudah dihapus." };

  const nowIso = new Date().toISOString();
  try {
    await db.batch([
      // Hapus lunak: riwayat transaksi tetap utuh dan dapat diaudit.
      db.prepare("UPDATE products SET deleted_at = ?, updated_at = ? WHERE id = ?").bind(nowIso, nowIso, id),
      db
        .prepare(
          "INSERT INTO audit_logs (id, user_id, user_name, action, description, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        )
        .bind(
          newId(),
          user.id,
          user.full_name,
          "delete_product",
          `Menghapus barang ${product.name} (${product.product_code})`,
          nowIso,
        ),
    ]);
    refreshProductViews();
    return { ok: true, message: `Barang "${product.name}" berhasil dihapus.` };
  } catch (error) {
    console.error("deleteProductAction", error);
    return { ok: false, error: "Gagal menghapus barang. Coba lagi." };
  }
}

