export type Role = "admin" | "penjaga";

export type StockStatus = "aman" | "menipis" | "habis";

export type SessionUser = {
  id: string;
  full_name: string;
  username: string;
  role: Role;
  is_active: number;
};

export type Profile = SessionUser & {
  created_at: string;
};

export type Product = {
  id: string;
  product_code: string;
  name: string;
  category: string;
  unit: string;
  purchase_price: number;
  selling_price: number;
  stock: number;
  minimum_stock: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type TransactionType = "masuk" | "keluar" | "koreksi";

export type StockTransaction = {
  id: string;
  product_id: string;
  product_name: string;
  product_code: string;
  transaction_type: TransactionType;
  quantity: number;
  stock_before: number;
  stock_after: number;
  note: string | null;
  user_id: string;
  user_name: string;
  created_at: string;
};

export type AuditLog = {
  id: string;
  user_id: string | null;
  user_name: string;
  action: string;
  description: string;
  created_at: string;
};

export type StockChartData = {
  labels: string[];
  fullLabels: string[];
  masuk: number[];
  keluar: number[];
};

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

export type StoreSettings = {
  store_name: string;
  store_address: string;
  store_phone: string;
  default_minimum_stock: string;
};
