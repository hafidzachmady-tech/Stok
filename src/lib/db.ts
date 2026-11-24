import type { D1Database } from "@cloudflare/workers-types";
import { getEnv } from "./env";
import { seedDefaults } from "./seed";

/**
 * Skema database. Dijalankan secara idempoten (CREATE ... IF NOT EXISTS)
 * oleh server saat pertama kali dipakai, sehingga deployment baru selalu
 * memiliki struktur tabel yang benar tanpa perlu akses SQL manual.
 */
const SCHEMA_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS profiles ( id TEXT PRIMARY KEY, full_name TEXT NOT NULL, username TEXT NOT NULL COLLATE NOCASE UNIQUE, password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK (role IN ('admin','penjaga')), is_active INTEGER NOT NULL DEFAULT 1, failed_attempts INTEGER NOT NULL DEFAULT 0, locked_until INTEGER, created_at TEXT NOT NULL )`,
  `CREATE TABLE IF NOT EXISTS sessions ( id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, created_at TEXT NOT NULL, expires_at INTEGER NOT NULL )`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)`,
  `CREATE TABLE IF NOT EXISTS products ( id TEXT PRIMARY KEY, product_code TEXT NOT NULL COLLATE NOCASE UNIQUE, name TEXT NOT NULL, category TEXT NOT NULL, unit TEXT NOT NULL, purchase_price INTEGER NOT NULL DEFAULT 0 CHECK (purchase_price >= 0), selling_price INTEGER NOT NULL DEFAULT 0 CHECK (selling_price >= 0), stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0), minimum_stock INTEGER NOT NULL DEFAULT 0 CHECK (minimum_stock >= 0), created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT )`,
  `CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)`,
  `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`,
  `CREATE INDEX IF NOT EXISTS idx_products_deleted ON products(deleted_at)`,
  `CREATE TABLE IF NOT EXISTS stock_transactions ( id TEXT PRIMARY KEY, product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT, product_name TEXT NOT NULL, product_code TEXT NOT NULL, transaction_type TEXT NOT NULL CHECK (transaction_type IN ('masuk','keluar','koreksi')), quantity INTEGER NOT NULL CHECK (quantity > 0), stock_before INTEGER NOT NULL CHECK (stock_before >= 0), stock_after INTEGER NOT NULL CHECK (stock_after >= 0), note TEXT, user_id TEXT NOT NULL REFERENCES profiles(id), user_name TEXT NOT NULL, created_at TEXT NOT NULL )`,
  `CREATE INDEX IF NOT EXISTS idx_tx_product ON stock_transactions(product_id)`,
  `CREATE INDEX IF NOT EXISTS idx_tx_created ON stock_transactions(created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_tx_type ON stock_transactions(transaction_type)`,
  `CREATE TABLE IF NOT EXISTS audit_logs ( id TEXT PRIMARY KEY, user_id TEXT, user_name TEXT NOT NULL, action TEXT NOT NULL, description TEXT NOT NULL, created_at TEXT NOT NULL )`,
  `CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS settings ( key TEXT PRIMARY KEY, value TEXT NOT NULL )`,
];

const SCHEMA_VERSION = "1";


let schemaReady: Promise<void> | null = null;

async function schemaUpToDate(db: D1Database): Promise<boolean> {
  try {
    const row = await db
      .prepare("SELECT value FROM settings WHERE key = 'schema_version'")
      .first<{ value: string }>();
    return row?.value === SCHEMA_VERSION;
  } catch {
    return false;
  }
}

async function init(db: D1Database): Promise<void> {
  if (!(await schemaUpToDate(db))) {
    // DDL dijalankan per pernyataan agar kompatibel dengan D1 (exec multi-baris
    // tidak dapat diandalkan untuk CREATE TABLE).
    for (const statement of SCHEMA_STATEMENTS) {
      await db.prepare(statement).run();
    }
    await db
      .prepare(
        "INSERT INTO settings (key, value) VALUES ('schema_version', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      )
      .bind(SCHEMA_VERSION)
      .run();
  }
  await seedDefaults(db);
}

export async function getDb(): Promise<D1Database> {
  const env = await getEnv();
  if (!env.DB) {
    throw new Error("Binding database DB tidak tersedia.");
  }
  if (!schemaReady) {
    schemaReady = init(env.DB).catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  await schemaReady;
  return env.DB;
}

export type StoreSettings = {
  store_name: string;
  store_address: string;
  store_phone: string;
  default_minimum_stock: string;
};

export async function getSettings(): Promise<StoreSettings> {
  const db = await getDb();
  const rows = await db
    .prepare("SELECT key, value FROM settings")
    .all<{ key: string; value: string }>();
  const map = new Map((rows.results ?? []).map((r) => [r.key, r.value]));
  return {
    store_name: map.get("store_name") ?? "TokoKelontong",
    store_address: map.get("store_address") ?? "",
    store_phone: map.get("store_phone") ?? "",
    default_minimum_stock: map.get("default_minimum_stock") ?? "5",
  };
}
