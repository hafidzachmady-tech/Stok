"use server";

import { revalidatePath } from "next/cache";
import { auditLog, requireAdmin } from "../auth";
import { getDb } from "../db";
import { loadDemoData } from "../seed";
import type { ActionResult } from "../types";
import { nonNegativeInt, str } from "../validate";

export async function saveSettingsAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const storeName = str(formData, "store_name");
  const storeAddress = str(formData, "store_address").slice(0, 200);
  const storePhone = str(formData, "store_phone").slice(0, 30);
  const defaultMin = nonNegativeInt(formData, "default_minimum_stock");

  if (!storeName) return { ok: false, error: "Nama toko wajib diisi." };
  if (storeName.length > 80) return { ok: false, error: "Nama toko maksimal 80 karakter." };
  if (defaultMin === null) {
    return { ok: false, error: "Batas minimum default harus berupa angka tidak negatif." };
  }
  if (defaultMin > 10_000) return { ok: false, error: "Batas minimum default terlalu besar." };

  const sql = await getDb();
  const values: Array<[string, string]> = [
    ["store_name", storeName],
    ["store_address", storeAddress],
    ["store_phone", storePhone],
    ["default_minimum_stock", String(defaultMin)],
  ];

  try {
    await sql.begin(async (tx) => {
      for (const [key, value] of values) {
        await tx`
          insert into settings (key, value) values (${key}, ${value})
          on conflict (key) do update set value = excluded.value
        `;
      }
      await tx`
        insert into audit_logs (id, user_id, user_name, action, description, created_at)
        values (${crypto.randomUUID()}, ${admin.id}, ${admin.full_name}, 'update_settings',
          'Memperbarui pengaturan toko', now())
      `;
    });
    revalidatePath("/pengaturan");
    revalidatePath("/beranda");
    revalidatePath("/belanja");
    return { ok: true, message: "Pengaturan toko berhasil disimpan." };
  } catch (error) {
    console.error("saveSettingsAction", error);
    return { ok: false, error: "Gagal menyimpan pengaturan. Coba lagi." };
  }
}

export async function loadDemoDataAction(): Promise<ActionResult> {
  const admin = await requireAdmin();
  const sql = await getDb();
  try {
    await loadDemoData(sql, admin.id, admin.full_name);
    revalidatePath("/barang");
    revalidatePath("/beranda");
    revalidatePath("/riwayat");
    revalidatePath("/belanja");
    revalidatePath("/pengaturan");
    return { ok: true, message: "Data contoh berhasil dimuat." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal memuat data contoh. Coba lagi.";
    return { ok: false, error: message };
  }
}
