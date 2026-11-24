import type { D1Database } from "@cloudflare/workers-types";
import { getEnv } from "./env";
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

async function insertDemoData(db: D1Database, adminId: string, adminName: string) {
  const nowIso = new Date().toISOString();
  const productIds = new Map<string, string>();
  const stocks = new Map<string, number>();

  const statements: D1PreparedStatement[] = [];
  for (const p of DEMO_PRODUCTS) {
    const id = newId();
    productIds.set(p.code, id);
    stocks.set(p.code, p.stock);
    statements.push(
      db
        .prepare(
          `INSERT INTO products (id, product_code, name, category, unit, purchase_price, selling_price, stock, minimum_stock, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(id, p.code, p.name, p.category, p.unit, p.purchase_price, p.selling_price, p.stock, p.minimum_stock, nowIso, nowIso),
    );
  }
  if (statements.length) await db.batch(statements);

  type Tx = {
    productId: string;
    name: string;
    code: string;
    type: "masuk" | "keluar";
    qty: number;
    before: number;
    after: number;
    note: string;
    createdAt: string;
  };

  const simulation = new Map(stocks);
  const txs: Tx[] = [];

  const apply = (
    code: string,
    type: "masuk" | "keluar",
    qty: number,
    note: string,
    daysAgo: number,
  ) => {
    const product = DEMO_PRODUCTS.find((item) => item.code === code);
    const productId = productIds.get(code);
    if (!product || !productId || qty <= 0) return;
    const before = simulation.get(code) ?? 0;
    if (type === "keluar" && qty > before) return;
    const after = type === "masuk" ? before + qty : before - qty;
    simulation.set(code, after);
    txs.push({
      productId,
      name: product.name,
      code,
      type,
      qty,
      before,
      after,
      note,
      createdAt: isoAt(daysAgoKey(daysAgo), 9 + (qty % 8), (qty * 7) % 60),
    });
  };

  for (const [code, daysAgo, type, qty, note] of DEMO_TRANSACTIONS) {
    apply(code, type, qty, note, daysAgo);
  }

  // Transaksi penyesuaian dihitung dari stok hasil simulasi agar stok akhir
  // demo sesuai target (ada barang menipis dan habis).
  for (const p of DEMO_PRODUCTS) {
    const target = DEMO_FINAL_TARGET[p.code];
    if (target === undefined) continue;
    const current = simulation.get(p.code) ?? 0;
    if (current < target) {
      apply(p.code, "masuk", target - current, "Penyesuaian stok", 1);
      continue;
    }
    let remaining = current - target;
    let step = 0;
    while (remaining > 0 && step < 6) {
      const part = Math.ceil(remaining / 2);
      apply(p.code, "keluar", part, "Penjualan harian", 1 + (step % 3));
      remaining -= part;
      step += 1;
    }
  }

  const txStatements: D1PreparedStatement[] = txs.map((tx) =>
    db
      .prepare(
        `INSERT INTO stock_transactions (id, product_id, product_name, product_code, transaction_type, quantity, stock_before, stock_after, note, user_id, user_name, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        newId(),
        tx.productId,
        tx.name,
        tx.code,
        tx.type,
        tx.qty,
        tx.before,
        tx.after,
        tx.note,
        adminId,
        adminName,
        tx.createdAt,
      ),
  );

  stocks.clear();
  for (const [code, stock] of simulation) stocks.set(code, stock);

  const finalStatements: D1PreparedStatement[] = [];
  for (const [code, stock] of stocks) {
    const productId = productIds.get(code);
    if (!productId) continue;
    finalStatements.push(
      db.prepare("UPDATE products SET stock = ?, updated_at = ? WHERE id = ?").bind(stock, nowIso, productId),
    );
  }

  if (txStatements.length) await db.batch(txStatements);
  if (finalStatements.length) await db.batch(finalStatements);

  await db
    .prepare(
      `INSERT INTO audit_logs (id, user_id, user_name, action, description, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(newId(), adminId, adminName, "seed_demo", "Memuat data contoh barang dan riwayat transaksi", nowIso)
    .run();
}

/**
 * Provisioning data awal.
 * - DEMO_MODE=1 (demo/preview) atau lingkungan pengembangan: akun demo
 *   admin/admin beserta data contoh dibuat agar dashboard tidak kosong.
 * - Produksi: admin dibuat HANYA bila ADMIN_PASSWORD disediakan melalui
 *   environment variable, dan tanpa data contoh (harus disetujui admin
 *   lewat halaman Pengaturan).
 */
export async function seedDefaults(db: D1Database): Promise<void> {
  const existing = await db.prepare("SELECT COUNT(*) AS n FROM profiles").first<{ n: number }>();
  if ((existing?.n ?? 0) > 0) return;

  const env = await getEnv();
  const isDev = process.env.NODE_ENV !== "production";
  const demoMode = env.DEMO_MODE === "1" || env.DEMO_MODE === "true";
  const nowIso = new Date().toISOString();
  const adminId = newId();

  if (demoMode || isDev) {
    const username = (env.ADMIN_USERNAME || "admin").trim().toLowerCase() || "admin";
    const password = env.ADMIN_PASSWORD || "admin";
    const passwordHash = await hashPassword(password);
    await db
      .prepare(
        `INSERT INTO profiles (id, full_name, username, password_hash, role, is_active, created_at) VALUES (?, ?, ?, ?, 'admin', 1, ?)`,
      )
      .bind(adminId, "Admin Toko", username, passwordHash, nowIso)
      .run();
    await insertDemoData(db, adminId, "Admin Toko");
    return;
  }

  if (env.ADMIN_PASSWORD && env.ADMIN_PASSWORD.length >= 8) {
    const username = (env.ADMIN_USERNAME || "admin").trim().toLowerCase() || "admin";
    const passwordHash = await hashPassword(env.ADMIN_PASSWORD);
    await db
      .prepare(
        `INSERT INTO profiles (id, full_name, username, password_hash, role, is_active, created_at) VALUES (?, ?, ?, ?, 'admin', 1, ?)`,
      )
      .bind(adminId, "Admin Toko", username, passwordHash, nowIso)
      .run();
    await db
      .prepare(
        `INSERT INTO audit_logs (id, user_id, user_name, action, description, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(newId(), adminId, "Admin Toko", "provision_admin", "Akun admin dibuat dari environment variable", nowIso)
      .run();
  }
}

/** Apakah mode demo aktif (untuk menampilkan petunjuk kredensial demo). */
export async function isDemoMode(): Promise<boolean> {
  const env = await getEnv();
  return env.DEMO_MODE === "1" || env.DEMO_MODE === "true" || process.env.NODE_ENV !== "production";
}

/** Muat data contoh secara manual (persetujuan admin lewat Pengaturan). */
export async function loadDemoData(db: D1Database, userId: string, userName: string): Promise<void> {
  const existing = await db
    .prepare("SELECT COUNT(*) AS n FROM products WHERE deleted_at IS NULL")
    .first<{ n: number }>();
  if ((existing?.n ?? 0) > 0) {
    throw new Error("Data barang sudah ada. Data contoh hanya dapat dimuat saat daftar barang masih kosong.");
  }
  await insertDemoData(db, userId, userName);
}

