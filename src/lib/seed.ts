import type { Database } from "./db";
import { isDemoMode } from "./env";
import { hashPassword, newId } from "./password";
import { isoAt, daysAgoKey } from "./date";

type DemoProduct = {
  code: string;
  name: string;
  category: string;
  unit: string;
  purchase_price: number;
  selling_price: number;
  stock: number;
  minimum_stock: number;
};

const DEMO_PRODUCTS: DemoProduct[] = [
  { code: "BRG001", name: "Beras Pandan Wangi 5kg", category: "Sembako", unit: "karung", purchase_price: 62000, selling_price: 68000, stock: 24, minimum_stock: 10 },
  { code: "BRG002", name: "Minyak Goreng 1L", category: "Sembako", unit: "botol", purchase_price: 15000, selling_price: 17500, stock: 18, minimum_stock: 12 },
  { code: "BRG003", name: "Gula Pasir 1kg", category: "Sembako", unit: "kg", purchase_price: 14000, selling_price: 16000, stock: 22, minimum_stock: 10 },
  { code: "BRG004", name: "Telur Ayam", category: "Sembako", unit: "kg", purchase_price: 26000, selling_price: 29000, stock: 14, minimum_stock: 8 },
  { code: "BRG005", name: "Sabun Mandi Batang", category: "Kebutuhan Rumah", unit: "pcs", purchase_price: 3500, selling_price: 5000, stock: 30, minimum_stock: 10 },
  { code: "BRG006", name: "Indomie Goreng", category: "Makanan Instan", unit: "bungkus", purchase_price: 2900, selling_price: 3500, stock: 35, minimum_stock: 20 },
  { code: "BRG007", name: "Kopi Sachet", category: "Minuman", unit: "sachet", purchase_price: 1200, selling_price: 2000, stock: 45, minimum_stock: 20 },
  { code: "BRG008", name: "Air Mineral 600ml", category: "Minuman", unit: "botol", purchase_price: 2500, selling_price: 4000, stock: 20, minimum_stock: 12 },
  { code: "BRG009", name: "Sabun Cuci Piring 800ml", category: "Kebutuhan Rumah", unit: "botol", purchase_price: 9500, selling_price: 12000, stock: 16, minimum_stock: 6 },
  { code: "BRG010", name: "Teh Celup Kotak", category: "Minuman", unit: "box", purchase_price: 6000, selling_price: 8000, stock: 12, minimum_stock: 5 },
];

/** Riwayat contoh: [kode barang, hari lalu, jenis, jumlah, catatan] */
const DEMO_TRANSACTIONS: Array<[string, number, "masuk" | "keluar", number, string]> = [
  ["BRG001", 20, "masuk", 15, "Kulakan dari supplier utama"],
  ["BRG002", 20, "masuk", 24, "Kulakan mingguan"],
  ["BRG006", 19, "masuk", 40, "Stok tambahan dari distributor"],
  ["BRG001", 18, "keluar", 3, "Penjualan harian"],
  ["BRG006", 18, "keluar", 12, "Penjualan harian"],
  ["BRG003", 17, "masuk", 20, "Kulakan gula pasir"],
  ["BRG007", 17, "keluar", 8, "Penjualan harian"],
  ["BRG004", 16, "masuk", 10, "Telur dari peternak"],
  ["BRG002", 15, "keluar", 6, "Penjualan harian"],
  ["BRG008", 15, "masuk", 24, "Kulakan air mineral"],
  ["BRG005", 14, "masuk", 24, "Stok sabun"],
  ["BRG006", 13, "keluar", 18, "Penjualan harian"],
  ["BRG007", 12, "masuk", 60, "Kulakan kopi sachet"],
  ["BRG001", 11, "keluar", 4, "Penjualan harian"],
  ["BRG009", 10, "masuk", 12, "Kulakan kebutuhan rumah"],
  ["BRG004", 9, "keluar", 4, "Penjualan harian"],
  ["BRG003", 8, "keluar", 6, "Penjualan harian"],
  ["BRG002", 7, "masuk", 12, "Kulakan minyak goreng"],
  ["BRG005", 6, "keluar", 9, "Penjualan harian"],
  ["BRG010", 6, "masuk", 10, "Kulakan teh celup"],
  ["BRG006", 5, "keluar", 20, "Penjualan harian"],
  ["BRG008", 4, "keluar", 8, "Penjualan harian"],
  ["BRG001", 4, "keluar", 2, "Penjualan harian"],
  ["BRG007", 3, "keluar", 15, "Penjualan harian"],
  ["BRG002", 2, "keluar", 5, "Penjualan harian"],
  ["BRG004", 2, "keluar", 3, "Penjualan harian"],
  ["BRG009", 1, "keluar", 4, "Penjualan harian"],
];

/** Target stok akhir demo agar ada barang menipis dan habis. */
const DEMO_FINAL_TARGET: Record<string, number> = {
  BRG002: 8,
  BRG004: 6,
  BRG006: 0,
  BRG008: 12,
};

type TxRow = {
  id: string;
  product_id: string;
  product_name: string;
  product_code: string;
  transaction_type: "masuk" | "keluar";
  quantity: number;
  stock_before: number;
  stock_after: number;
  note: string;
  user_id: string;
  user_name: string;
  created_at: string;
};

export async function insertDemoData(
  sql: Database,
  adminId: string,
  adminName: string,
): Promise<void> {
  const productIds = new Map<string, string>();
  const productRows = DEMO_PRODUCTS.map((product) => {
    const id = newId();
    productIds.set(product.code, id);
    return {
      id,
      product_code: product.code,
      name: product.name,
      category: product.category,
      unit: product.unit,
      purchase_price: product.purchase_price,
      selling_price: product.selling_price,
      stock: product.stock,
      minimum_stock: product.minimum_stock,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });

  const simulation = new Map(DEMO_PRODUCTS.map((product) => [product.code, product.stock]));
  const transactions: TxRow[] = [];

  const apply = (code: string, type: "masuk" | "keluar", qty: number, note: string, daysAgo: number) => {
    const product = DEMO_PRODUCTS.find((item) => item.code === code);
    const productId = productIds.get(code);
    if (!product || !productId || qty <= 0) return;
    const before = simulation.get(code) ?? 0;
    if (type === "keluar" && qty > before) return;
    const after = type === "masuk" ? before + qty : before - qty;
    simulation.set(code, after);
    transactions.push({
      id: newId(),
      product_id: productId,
      product_name: product.name,
      product_code: code,
      transaction_type: type,
      quantity: qty,
      stock_before: before,
      stock_after: after,
      note,
      user_id: adminId,
      user_name: adminName,
      created_at: isoAt(daysAgoKey(daysAgo), 9 + (qty % 8), (qty * 7) % 60),
    });
  };

  for (const [code, daysAgo, type, qty, note] of DEMO_TRANSACTIONS) {
    apply(code, type, qty, note, daysAgo);
  }

  // Penyesuaian agar stok akhir demo sesuai target (ada yang menipis & habis),
  // dibagi ke beberapa hari supaya grafik tetap wajar.
  for (const product of DEMO_PRODUCTS) {
    const target = DEMO_FINAL_TARGET[product.code];
    if (target === undefined) continue;
    const current = simulation.get(product.code) ?? 0;
    if (current < target) {
      apply(product.code, "masuk", target - current, "Penyesuaian stok", 1);
      continue;
    }
    let remaining = current - target;
    let step = 0;
    while (remaining > 0 && step < 6) {
      const part = Math.ceil(remaining / 2);
      apply(product.code, "keluar", part, "Penjualan harian", 1 + (step % 3));
      remaining -= part;
      step += 1;
    }
  }

  await sql.begin(async (tx) => {
    await tx`insert into products ${tx(productRows)}`;
    if (transactions.length > 0) {
      await tx`insert into stock_transactions ${tx(transactions)}`;
    }
    for (const [code, stock] of simulation) {
      const id = productIds.get(code);
      if (!id) continue;
      await tx`update products set stock = ${stock}, updated_at = now() where id = ${id}`;
    }
    await tx`
      insert into audit_logs (id, user_id, user_name, action, description, created_at)
      values (${newId()}, ${adminId}, ${adminName}, 'seed_demo',
        'Memuat data contoh barang dan riwayat transaksi', now())
    `;
  });
}

/**
 * Provisioning data awal.
 * - DEMO_MODE=1 (demo/preview) atau lingkungan pengembangan: akun demo
 *   admin/admin beserta data contoh dibuat agar dashboard tidak kosong.
 * - Produksi: admin dibuat HANYA bila ADMIN_PASSWORD disediakan melalui
 *   environment variable, dan tanpa data contoh.
 */
export async function seedDefaults(sql: Database): Promise<void> {
  const rows = await sql<{ n: number }[]>`select count(*)::int as n from profiles`;
  if ((rows[0]?.n ?? 0) > 0) return;

  const demo = isDemoMode();
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  const adminUsername = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase() || "admin";
  const adminId = newId();
  const adminName = "Admin Toko";

  if (demo) {
    const passwordHash = await hashPassword(adminPassword || "admin");
    await sql`
      insert into profiles (id, full_name, username, password_hash, role, is_active, created_at)
      values (${adminId}, ${adminName}, ${adminUsername}, ${passwordHash}, 'admin', 1, now())
    `;
    await insertDemoData(sql, adminId, adminName);
    return;
  }

  if (adminPassword.length >= 8) {
    const passwordHash = await hashPassword(adminPassword);
    await sql`
      insert into profiles (id, full_name, username, password_hash, role, is_active, created_at)
      values (${adminId}, ${adminName}, ${adminUsername}, ${passwordHash}, 'admin', 1, now())
    `;
    await sql`
      insert into audit_logs (id, user_id, user_name, action, description, created_at)
      values (${newId()}, ${adminId}, ${adminName}, 'provision_admin',
        'Akun admin dibuat dari environment variable', now())
    `;
  }
}

/** Muat data contoh secara manual (persetujuan admin lewat Pengaturan). */
export async function loadDemoData(
  sql: Database,
  userId: string,
  userName: string,
): Promise<void> {
  const rows = await sql<{ n: number }[]>`
    select count(*)::int as n from products where deleted_at is null
  `;
  if ((rows[0]?.n ?? 0) > 0) {
    throw new Error("Data barang sudah ada. Data contoh hanya dapat dimuat saat daftar barang masih kosong.");
  }
  await insertDemoData(sql, userId, userName);
}
