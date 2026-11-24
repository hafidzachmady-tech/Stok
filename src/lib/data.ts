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

const ACTIVE = "deleted_at IS NULL";

export type DashboardStats = {
  totalBarang: number;
  totalStok: number;
  menipis: number;
  habis: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = await getDb();
  const row = await db
    .prepare(
      `SELECT
         COUNT(*) AS total_barang,
         COALESCE(SUM(stock), 0) AS total_stok,
         COALESCE(SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END), 0) AS habis,
         COALESCE(SUM(CASE WHEN stock > 0 AND stock <= minimum_stock THEN 1 ELSE 0 END), 0) AS menipis
       FROM products WHERE ${ACTIVE}`,
    )
    .first<{ total_barang: number; total_stok: number; habis: number; menipis: number }>();
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
  const db = await getDb();
  const { startKey, endKey } = chartRange(period);
  const rows = await db
    .prepare(
      `SELECT date(created_at, '+7 hours') AS day,
              transaction_type AS type,
              COALESCE(SUM(quantity), 0) AS total
       FROM stock_transactions
       WHERE created_at >= ? AND created_at < ?
         AND transaction_type IN ('masuk','keluar')
       GROUP BY day, type`,
    )
    .bind(jakartaDayStartIso(startKey), jakartaDayStartIso(addDaysToKey(endKey, 1)))
    .all<{ day: string; type: string; total: number }>();

  const map = new Map<string, { masuk: number; keluar: number }>();
  for (const row of rows.results ?? []) {
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
  const db = await getDb();
  const limited = limit ? ` LIMIT ${Math.max(1, Math.floor(limit))}` : "";
  const rows = await db
    .prepare(
      `SELECT id, name, product_code, unit, stock, minimum_stock, category
       FROM products
       WHERE ${ACTIVE} AND stock <= minimum_stock
       ORDER BY (stock = 0) DESC, stock ASC, name ASC${limited}`,
    )
    .all<AlertProduct>();
  return rows.results ?? [];
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
  const db = await getDb();
  const rows = await db
    .prepare(
      `SELECT id, product_name, transaction_type, quantity, stock_after, user_name, created_at
       FROM stock_transactions
       ORDER BY created_at DESC, rowid DESC
       LIMIT ?`,
    )
    .bind(limit)
    .all<RecentActivity>();
  return rows.results ?? [];
}

export async function getRecentAuditLogs(limit = 6): Promise<AuditLog[]> {
  const db = await getDb();
  const rows = await db
    .prepare(`SELECT * FROM audit_logs ORDER BY created_at DESC, rowid DESC LIMIT ?`)
    .bind(limit)
    .all<AuditLog>();
  return rows.results ?? [];
}

export type ProductFilters = {
  q?: string;
  kategori?: string;
  status?: string;
  sort?: string;
  dir?: string;
};

const SORT_COLUMNS: Record<string, string> = {
  nama: "name",
  stok: "stock",
  harga: "selling_price",
  kode: "product_code",
};

export async function getProducts(filters: ProductFilters): Promise<Product[]> {
  const db = await getDb();
  const where: string[] = [ACTIVE];
  const params: unknown[] = [];

  const q = (filters.q ?? "").trim();
  if (q) {
    where.push("(name LIKE ? OR product_code LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }
  const kategori = (filters.kategori ?? "").trim();
  if (kategori && kategori !== "semua") {
    where.push("category = ?");
    params.push(kategori);
  }
  const status = filters.status ?? "";
  if (status === "aman") where.push("stock > minimum_stock");
  if (status === "menipis") where.push("stock > 0 AND stock <= minimum_stock");
  if (status === "habis") where.push("stock = 0");

  const sortColumn = SORT_COLUMNS[filters.sort ?? "nama"] ?? "name";
  const direction = filters.dir === "desc" ? "DESC" : "ASC";

  const rows = await db
    .prepare(
      `SELECT * FROM products WHERE ${where.join(" AND ")} ORDER BY ${sortColumn} ${direction}, name ASC`,
    )
    .bind(...params)
    .all<Product>();
  return rows.results ?? [];
}

export async function getCategories(): Promise<string[]> {
  const db = await getDb();
  const rows = await db
    .prepare(
      `SELECT DISTINCT category FROM products WHERE ${ACTIVE} AND category <> '' ORDER BY category ASC`,
    )
    .all<{ category: string }>();
  return (rows.results ?? []).map((r) => r.category);
}

export async function getProductById(id: string): Promise<Product | null> {
  const db = await getDb();
  return db.prepare("SELECT * FROM products WHERE id = ? AND deleted_at IS NULL").bind(id).first<Product>();
}

export async function getProductOptions(): Promise<
  Array<Pick<Product, "id" | "product_code" | "name" | "unit" | "stock" | "minimum_stock">>
> {
  const db = await getDb();
  const rows = await db
    .prepare(
      `SELECT id, product_code, name, unit, stock, minimum_stock FROM products
       WHERE ${ACTIVE} ORDER BY name ASC`,
    )
    .all<Pick<Product, "id" | "product_code" | "name" | "unit" | "stock" | "minimum_stock">>();
  return rows.results ?? [];
}

export async function getRestockList(): Promise<
  Array<AlertProduct & { recommended: number; status: "menipis" | "habis" }>
> {
  const items = await getLowStockProducts();
  return items.map((p) => ({
    ...p,
    recommended: Math.max(0, 2 * p.minimum_stock - p.stock),
    status: p.stock <= 0 ? "habis" : "menipis",
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
  const db = await getDb();
  const where: string[] = ["1 = 1"];
  const params: unknown[] = [];

  const q = (filters.q ?? "").trim();
  if (q) {
    where.push("(product_name LIKE ? OR product_code LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }
  const jenis = filters.jenis ?? "";
  if (jenis === "masuk" || jenis === "keluar" || jenis === "koreksi") {
    where.push("transaction_type = ?");
    params.push(jenis);
  }
  if (filters.dari) {
    where.push("created_at >= ?");
    params.push(jakartaDayStartIso(filters.dari));
  }
  if (filters.sampai) {
    where.push("created_at < ?");
    params.push(jakartaDayStartIso(addDaysToKey(filters.sampai, 1)));
  }

  const limit = Math.min(1000, Math.max(1, filters.limit ?? 300));
  const rows = await db
    .prepare(
      `SELECT * FROM stock_transactions WHERE ${where.join(" AND ")}
       ORDER BY created_at DESC, rowid DESC LIMIT ?`,
    )
    .bind(...params, limit)
    .all<StockTransaction>();
  return rows.results ?? [];
}

export async function getProfiles(): Promise<Profile[]> {
  const db = await getDb();
  const rows = await db
    .prepare(
      `SELECT id, full_name, username, role, is_active, created_at FROM profiles
       ORDER BY (role = 'admin') DESC, created_at ASC`,
    )
    .all<Profile>();
  return rows.results ?? [];
}

export async function getAuditLogs(limit = 50): Promise<AuditLog[]> {
  const db = await getDb();
  const rows = await db
    .prepare("SELECT * FROM audit_logs ORDER BY created_at DESC, rowid DESC LIMIT ?")
    .bind(limit)
    .all<AuditLog>();
  return rows.results ?? [];
}
