import { getDb } from "./db";
import {
  addDaysToKey,
  currentMonthStartKey,
  daysAgoKey,
  jakartaDayKey,
  jakartaDayStartIso,
  rangeKeys,
  shortDayLabel,
  longDayLabel,
} from "./date";
import type {
  AuditLog,
  Product,
  StockChartData,
  StockTransaction,
  Profile,
} from "./types";

const ACTIVE = "deleted_at is null";

function iso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return String(value ?? "");
}

function isoOrNull(value: unknown): string | null {
  return value ? iso(value) : null;
}

type ProductRow = Omit<Product, "created_at" | "updated_at" | "deleted_at"> & {
  created_at: unknown;
  updated_at: unknown;
  deleted_at: unknown;
};

function mapProduct(row: ProductRow): Product {
  return {
    ...row,
    created_at: iso(row.created_at),
    updated_at: iso(row.updated_at),
    deleted_at: isoOrNull(row.deleted_at),
  };
}

type TransactionRow = Omit<StockTransaction, "created_at"> & { created_at: unknown };

function mapTransaction(row: TransactionRow): StockTransaction {
  return { ...row, created_at: iso(row.created_at) };
}

export type DashboardStats = {
  totalBarang: number;
  totalStok: number;
  menipis: number;
  habis: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const sql = await getDb();
  const rows = await sql<
    { total_barang: number; total_stok: number; menipis: number; habis: number }[]
  >`
    select
      count(*)::int as total_barang,
      coalesce(sum(stock), 0)::int as total_stok,
      coalesce(sum(case when stock = 0 then 1 else 0 end), 0)::int as habis,
      coalesce(sum(case when stock > 0 and stock <= minimum_stock then 1 else 0 end), 0)::int as menipis
    from products
    where deleted_at is null
  `;
  const row = rows[0];
  return {
    totalBarang: row?.total_barang ?? 0,
    totalStok: row?.total_stok ?? 0,
    menipis: row?.menipis ?? 0,
    habis: row?.habis ?? 0,
  };
}

export type ChartPeriod = "7" | "30" | "bulan";

export function chartRange(period: ChartPeriod): { startKey: string; endKey: string } {
  const endKey = jakartaDayKey();
  if (period === "bulan") return { startKey: currentMonthStartKey(), endKey };
  const days = period === "30" ? 30 : 7;
  return { startKey: daysAgoKey(days - 1), endKey };
}

export async function getStockChart(period: ChartPeriod): Promise<StockChartData> {
  const sql = await getDb();
  const { startKey, endKey } = chartRange(period);
  const rows = await sql<{ day: string; type: string; total: number }[]>`
    select
      to_char((created_at at time zone 'Asia/Jakarta')::date, 'YYYY-MM-DD') as day,
      transaction_type as type,
      coalesce(sum(quantity), 0)::int as total
    from stock_transactions
    where created_at >= ${jakartaDayStartIso(startKey)}
      and created_at < ${jakartaDayStartIso(addDaysToKey(endKey, 1))}
      and transaction_type in ('masuk', 'keluar')
    group by 1, 2
  `;

  const map = new Map<string, { masuk: number; keluar: number }>();
  for (const row of rows) {
    const entry = map.get(row.day) ?? { masuk: 0, keluar: 0 };
    if (row.type === "masuk") entry.masuk += row.total;
    if (row.type === "keluar") entry.keluar += row.total;
    map.set(row.day, entry);
  }

  const keys = rangeKeys(startKey, endKey);
  return {
    labels: keys.map(shortDayLabel),
    fullLabels: keys.map(longDayLabel),
    masuk: keys.map((k) => map.get(k)?.masuk ?? 0),
    keluar: keys.map((k) => map.get(k)?.keluar ?? 0),
  };
}

export type AlertProduct = Pick<
  Product,
  "id" | "name" | "product_code" | "unit" | "stock" | "minimum_stock" | "category"
>;

export async function getLowStockProducts(limit?: number): Promise<AlertProduct[]> {
  const sql = await getDb();
  const rows = limit
    ? await sql<AlertProduct[]>`
        select id, name, product_code, unit, stock, minimum_stock, category
        from products
        where deleted_at is null and stock <= minimum_stock
        order by (stock = 0) desc, stock asc, lower(name) asc
        limit ${Math.max(1, Math.floor(limit))}
      `
    : await sql<AlertProduct[]>`
        select id, name, product_code, unit, stock, minimum_stock, category
        from products
        where deleted_at is null and stock <= minimum_stock
        order by (stock = 0) desc, stock asc, lower(name) asc
      `;
  return rows;
}

export type RecentActivity = {
  id: string;
  product_name: string;
  transaction_type: string;
  quantity: number;
  stock_after: number;
  user_name: string;
  created_at: string;
};

export async function getRecentActivity(limit = 6): Promise<RecentActivity[]> {
  const sql = await getDb();
  const rows = await sql<(Omit<RecentActivity, "created_at"> & { created_at: unknown })[]>`
    select id, product_name, transaction_type, quantity, stock_after, user_name, created_at
    from stock_transactions
    order by created_at desc, id desc
    limit ${limit}
  `;
  return rows.map((row) => ({ ...row, created_at: iso(row.created_at) }));
}

export async function getRecentAuditLogs(limit = 6): Promise<AuditLog[]> {
  const sql = await getDb();
  const rows = await sql<(Omit<AuditLog, "created_at"> & { created_at: unknown })[]>`
    select id, user_id, user_name, action, description, created_at
    from audit_logs
    order by created_at desc, id desc
    limit ${limit}
  `;
  return rows.map((row) => ({ ...row, created_at: iso(row.created_at) }));
}

export type ProductFilters = {
  q?: string;
  kategori?: string;
  status?: string;
  sort?: string;
  dir?: string;
};

const SORT_COLUMNS: Record<string, string> = {
  nama: "lower(name)",
  stok: "stock",
  harga: "selling_price",
  kode: "product_code",
};

export async function getProducts(filters: ProductFilters): Promise<Product[]> {
  const sql = await getDb();
  const params: unknown[] = [];

  const bind = (value: unknown): string => {
    params.push(value);
    return `$${params.length}`;
  };

  let query = "select * from products where deleted_at is null";

  const q = (filters.q ?? "").trim();
  if (q) {
    const like = bind(`%${q}%`);
    query += ` and (name ilike ${like} or product_code ilike ${like})`;
  }

  const kategori = (filters.kategori ?? "").trim();
  if (kategori && kategori !== "semua") {
    query += ` and category = ${bind(kategori)}`;
  }

  const status = filters.status ?? "";
  if (status === "aman") query += " and stock > minimum_stock";
  if (status === "menipis") query += " and stock > 0 and stock <= minimum_stock";
  if (status === "habis") query += " and stock = 0";

  // Kolom & arah pengurutan berasal dari whitelist sehingga aman.
  const column = SORT_COLUMNS[filters.sort ?? "nama"] ?? "lower(name)";
  const direction = filters.dir === "desc" ? "desc" : "asc";
  query += ` order by ${column} ${direction}, lower(name) asc`;

  const rows = await sql.unsafe<ProductRow[]>(query, params as never[]);
  return rows.map(mapProduct);
}

export async function getCategories(): Promise<string[]> {
  const sql = await getDb();
  const rows = await sql<{ category: string }[]>`
    select distinct category from products
    where deleted_at is null and category <> ''
    order by category asc
  `;
  return rows.map((row) => row.category);
}

export async function getProductById(id: string): Promise<Product | null> {
  const sql = await getDb();
  const rows = await sql<ProductRow[]>`select * from products where id = ${id} and deleted_at is null`;
  return rows[0] ? mapProduct(rows[0]) : null;
}

export async function getProductOptions(): Promise<
  Array<Pick<Product, "id" | "product_code" | "name" | "unit" | "stock" | "minimum_stock">>
> {
  const sql = await getDb();
  return sql<Array<Pick<Product, "id" | "product_code" | "name" | "unit" | "stock" | "minimum_stock">>>`
    select id, product_code, name, unit, stock, minimum_stock from products
    where deleted_at is null
    order by lower(name) asc
  `;
}

export async function getRestockList(): Promise<
  Array<AlertProduct & { recommended: number; status: "menipis" | "habis" }>
> {
  const items = await getLowStockProducts();
  return items.map((product) => ({
    ...product,
    recommended: Math.max(0, 2 * product.minimum_stock - product.stock),
    status: product.stock <= 0 ? "habis" : "menipis",
  }));
}

export type TransactionFilters = {
  q?: string;
  jenis?: string;
  dari?: string;
  sampai?: string;
  limit?: number;
};

export async function getTransactions(filters: TransactionFilters): Promise<StockTransaction[]> {
  const sql = await getDb();
  const params: unknown[] = [];

  const bind = (value: unknown): string => {
    params.push(value);
    return `$${params.length}`;
  };

  let query = "select * from stock_transactions where true";

  const q = (filters.q ?? "").trim();
  if (q) {
    const like = bind(`%${q}%`);
    query += ` and (product_name ilike ${like} or product_code ilike ${like})`;
  }

  const jenis = filters.jenis ?? "";
  if (jenis === "masuk" || jenis === "keluar" || jenis === "koreksi") {
    query += ` and transaction_type = ${bind(jenis)}`;
  }

  if (filters.dari) {
    query += ` and created_at >= ${bind(jakartaDayStartIso(filters.dari))}`;
  }
  if (filters.sampai) {
    query += ` and created_at < ${bind(jakartaDayStartIso(addDaysToKey(filters.sampai, 1)))}`;
  }

  const limit = Math.min(1000, Math.max(1, filters.limit ?? 300));
  query += ` order by created_at desc, id desc limit ${bind(limit)}`;

  const rows = await sql.unsafe<TransactionRow[]>(query, params as never[]);
  return rows.map(mapTransaction);
}

export async function getProfiles(): Promise<Profile[]> {
  const sql = await getDb();
  const rows = await sql<(Omit<Profile, "created_at"> & { created_at: unknown })[]>`
    select id, full_name, username, role, is_active, created_at
    from profiles
    order by (role = 'admin') desc, created_at asc
  `;
  return rows.map((row) => ({ ...row, created_at: iso(row.created_at) }));
}

export async function getAuditLogs(limit = 50): Promise<AuditLog[]> {
  const sql = await getDb();
  const rows = await sql<(Omit<AuditLog, "created_at"> & { created_at: unknown })[]>`
    select id, user_id, user_name, action, description, created_at
    from audit_logs
    order by created_at desc, id desc
    limit ${limit}
  `;
  return rows.map((row) => ({ ...row, created_at: iso(row.created_at) }));
}
