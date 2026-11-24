"use server";

import { revalidatePath } from "next/cache";
import { auditLog, requireAdmin } from "../auth";
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

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
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
  const sql = await getDb();
  const rows = await sql<{ id: string }[]>`
    select id from products where upper(product_code) = upper(${code})
  `;
  const existing = rows[0];
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

  const sql = await getDb();

  try {
    if (id) {
      const rows = await sql<{ id: string }[]>`
        select id from products where id = ${id} and deleted_at is null
      `;
      if (!rows[0]) return { ok: false, error: "Barang tidak ditemukan atau sudah dihapus." };

      await sql.begin(async (tx) => {
        await tx`
          update products set
            product_code = ${data.productCode},
            name = ${data.name},
            category = ${data.category},
            unit = ${data.unit},
            purchase_price = ${data.purchasePrice},
            selling_price = ${data.sellingPrice},
            minimum_stock = ${data.minimumStock},
            updated_at = now()
          where id = ${id}
        `;
        await tx`
          insert into audit_logs (id, user_id, user_name, action, description, created_at)
          values (${newId()}, ${user.id}, ${user.full_name}, 'update_product',
            ${`Mengubah data barang ${data.name} (${data.productCode})`}, now())
        `;
      });
      refreshProductViews();
      return { ok: true, message: `Barang "${data.name}" berhasil diperbarui.` };
    }

    const productId = newId();
    await sql.begin(async (tx) => {
      await tx`
        insert into products (id, product_code, name, category, unit, purchase_price, selling_price, stock, minimum_stock, created_at, updated_at)
        values (${productId}, ${data.productCode}, ${data.name}, ${data.category}, ${data.unit},
          ${data.purchasePrice}, ${data.sellingPrice}, ${data.stock}, ${data.minimumStock}, now(), now())
      `;
      if (data.stock > 0) {
        await tx`
          insert into stock_transactions (id, product_id, product_name, product_code, transaction_type, quantity, stock_before, stock_after, note, user_id, user_name, created_at)
          values (${newId()}, ${productId}, ${data.name}, ${data.productCode}, 'masuk',
            ${data.stock}, 0, ${data.stock}, 'Stok awal barang baru', ${user.id}, ${user.full_name}, now())
        `;
      }
      await tx`
        insert into audit_logs (id, user_id, user_name, action, description, created_at)
        values (${newId()}, ${user.id}, ${user.full_name}, 'create_product',
          ${`Menambahkan barang ${data.name} (${data.productCode}), stok awal ${data.stock}, harga jual ${formatRupiah(data.sellingPrice)}`},
          now())
      `;
    });
    refreshProductViews();
    return { ok: true, message: `Barang "${data.name}" berhasil ditambahkan.` };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, error: `Kode barang "${data.productCode}" sudah digunakan. Gunakan kode lain.` };
    }
    console.error("saveProductAction", error);
    return { ok: false, error: "Gagal menyimpan barang. Periksa kembali data lalu coba lagi." };
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!id) return { ok: false, error: "Barang tidak ditemukan." };

  const sql = await getDb();
  const rows = await sql<{ id: string; name: string; product_code: string }[]>`
    select id, name, product_code from products where id = ${id} and deleted_at is null
  `;
  const product = rows[0];
  if (!product) return { ok: false, error: "Barang tidak ditemukan atau sudah dihapus." };

  try {
    // Hapus lunak: riwayat transaksi tetap utuh dan dapat diaudit.
    await sql.begin(async (tx) => {
      await tx`update products set deleted_at = now(), updated_at = now() where id = ${id}`;
      await tx`
        insert into audit_logs (id, user_id, user_name, action, description, created_at)
        values (${newId()}, ${user.id}, ${user.full_name}, 'delete_product',
          ${`Menghapus barang ${product.name} (${product.product_code})`}, now())
      `;
    });
    refreshProductViews();
    return { ok: true, message: `Barang "${product.name}" berhasil dihapus.` };
  } catch (error) {
    console.error("deleteProductAction", error);
    return { ok: false, error: "Gagal menghapus barang. Coba lagi." };
  }
}
