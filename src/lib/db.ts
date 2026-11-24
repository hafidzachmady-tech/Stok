import postgres from "postgres";
import { getDatabaseUrl } from "./env";
import { seedDefaults } from "./seed";

export type Database = ReturnType<typeof postgres>;

/**
 * Skema PostgreSQL. Dijalankan idempoten oleh server saat pertama kali
 * dipakai, sehingga deployment baru (Vercel + Supabase) langsung memiliki
 * struktur tabel yang benar. Salinan SQL yang sama tersedia di
 * db/schema.sql untuk dijalankan manual di Supabase SQL Editor.
 */
const SCHEMA_STATEMENTS: string[] = [
  `create table if not exists profiles (
    id text primary key,
    full_name text not null,
    username text not null unique,
    password_hash text not null,
    role text not null check (role in ('admin', 'penjaga')),
    is_active integer not null default 1,
    failed_attempts integer not null default 0,
    locked_until bigint,
    created_at timestamptz not null default now()
  )`,
  `create table if not exists sessions (
    id text primary key,
    user_id text not null references profiles (id) on delete cascade,
    created_at timestamptz not null default now(),
    expires_at bigint not null
  )`,
  `create index if not exists idx_sessions_user on sessions (user_id)`,
  `create table if not exists products (
    id text primary key,
    product_code text not null,
    name text not null,
    category text not null,
    unit text not null,
    purchase_price integer not null default 0 check (purchase_price >= 0),
    selling_price integer not null default 0 check (selling_price >= 0),
    stock integer not null default 0 check (stock >= 0),
    minimum_stock integer not null default 0 check (minimum_stock >= 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
  )`,
  `create unique index if not exists ux_products_code on products (upper(product_code))`,
  `create index if not exists idx_products_name on products (lower(name))`,
  `create index if not exists idx_products_category on products (category)`,
  `create index if not exists idx_products_deleted on products (deleted_at)`,
  `create table if not exists stock_transactions (
    id text primary key,
    product_id text not null references products (id) on delete restrict,
    product_name text not null,
    product_code text not null,
    transaction_type text not null check (transaction_type in ('masuk', 'keluar', 'koreksi')),
    quantity integer not null check (quantity > 0),
    stock_before integer not null check (stock_before >= 0),
    stock_after integer not null check (stock_after >= 0),
    note text,
    user_id text not null references profiles (id),
    user_name text not null,
    created_at timestamptz not null default now()
  )`,
  `create index if not exists idx_tx_product on stock_transactions (product_id)`,
  `create index if not exists idx_tx_created on stock_transactions (created_at desc)`,
  `create index if not exists idx_tx_type on stock_transactions (transaction_type)`,
  `create table if not exists audit_logs (
    id text primary key,
    user_id text references profiles (id) on delete set null,
    user_name text not null,
    action text not null,
    description text not null,
    created_at timestamptz not null default now()
  )`,
  `create index if not exists idx_audit_created on audit_logs (created_at desc)`,
  `create table if not exists settings (
    key text primary key,
    value text not null
  )`,
  // Akses langsung via PostgREST/anon ditutup; aplikasi hanya memakai koneksi server.
  `alter table profiles enable row level security`,
  `alter table sessions enable row level security`,
  `alter table products enable row level security`,
  `alter table stock_transactions enable row level security`,
  `alter table audit_logs enable row level security`,
  `alter table settings enable row level security`,
];

const SCHEMA_VERSION = "pg-1";

const globalState = globalThis as unknown as {
  __tokokelontongSql?: Database;
  __tokokelontongSchema?: Promise<void>;
};

function buildClient(url: string): Database {
  const host = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return "";
    }
  })();
  const isLocal = host === "localhost" || host === "127.0.0.1" || host === "::1" || host.endsWith(".internal");
  const sslDisabled = /sslmode=disable/.test(url);

  return postgres(url, {
    // Serverless: satu koneksi per instance fungsi, tanpa prepared statement
    // agar kompatibel dengan connection pooler Supabase (Supavisor).
    max: Number(process.env.DATABASE_POOL_MAX || 1),
    idle_timeout: 20,
    connect_timeout: 15,
    prepare: false,
    ssl: sslDisabled || isLocal ? false : true,
    onnotice: () => {},
  });
}

export function getSql(): Database {
  if (!globalState.__tokokelontongSql) {
    globalState.__tokokelontongSql = buildClient(getDatabaseUrl());
  }
  return globalState.__tokokelontongSql;
}

async function schemaUpToDate(sql: Database): Promise<boolean> {
  try {
    const rows = await sql<{ value: string }[]>`select value from settings where key = 'schema_version'`;
    return rows[0]?.value === SCHEMA_VERSION;
  } catch {
    return false;
  }
}

async function init(sql: Database): Promise<void> {
  if (!(await schemaUpToDate(sql))) {
    for (const statement of SCHEMA_STATEMENTS) {
      await sql.unsafe(statement);
    }
    await sql`
      insert into settings (key, value) values ('schema_version', ${SCHEMA_VERSION})
      on conflict (key) do update set value = excluded.value
    `;
  }
  await seedDefaults(sql);
}

/** Koneksi database yang siap dipakai (skema & data awal sudah dipastikan ada). */
export async function getDb(): Promise<Database> {
  const sql = getSql();
  if (!globalState.__tokokelontongSchema) {
    globalState.__tokokelontongSchema = init(sql).catch((error) => {
      globalState.__tokokelontongSchema = undefined;
      throw error;
    });
  }
  await globalState.__tokokelontongSchema;
  return sql;
}

export type StoreSettings = {
  store_name: string;
  store_address: string;
  store_phone: string;
  default_minimum_stock: string;
};

export async function getSettings(): Promise<StoreSettings> {
  const sql = await getDb();
  const rows = await sql<{ key: string; value: string }[]>`select key, value from settings`;
  const map = new Map(rows.map((row) => [row.key, row.value]));
  return {
    store_name: map.get("store_name") ?? "TokoKelontong",
    store_address: map.get("store_address") ?? "",
    store_phone: map.get("store_phone") ?? "",
    default_minimum_stock: map.get("default_minimum_stock") ?? "5",
  };
}
