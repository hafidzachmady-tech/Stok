-- ============================================================
-- TokoKelontong — Skema PostgreSQL (Supabase)
-- Jalankan di Supabase SQL Editor, atau biarkan aplikasi membuatnya
-- otomatis saat permintaan pertama (idempoten, versi skema dicatat
-- pada tabel settings).
-- ============================================================

create table if not exists profiles (
  id text primary key,
  full_name text not null,
  username text not null unique,
  password_hash text not null,
  role text not null check (role in ('admin', 'penjaga')),
  is_active integer not null default 1,
  failed_attempts integer not null default 0,
  locked_until bigint,
  created_at timestamptz not null default now()
);

create table if not exists sessions (
  id text primary key,
  user_id text not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at bigint not null
);
create index if not exists idx_sessions_user on sessions (user_id);

create table if not exists products (
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
);
-- Kode barang unik tanpa membedakan huruf besar/kecil.
create unique index if not exists ux_products_code on products (upper(product_code));
create index if not exists idx_products_name on products (lower(name));
create index if not exists idx_products_category on products (category);
create index if not exists idx_products_deleted on products (deleted_at);

create table if not exists stock_transactions (
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
);
create index if not exists idx_tx_product on stock_transactions (product_id);
create index if not exists idx_tx_created on stock_transactions (created_at desc);
create index if not exists idx_tx_type on stock_transactions (transaction_type);

create table if not exists audit_logs (
  id text primary key,
  user_id text references profiles (id) on delete set null,
  user_name text not null,
  action text not null,
  description text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_created on audit_logs (created_at desc);

create table if not exists settings (
  key text primary key,
  value text not null
);

-- ============================================================
-- Row Level Security
-- Aplikasi mengakses database hanya dari server memakai koneksi
-- Postgres (role owner). RLS diaktifkan tanpa policy sehingga kunci
-- anon/public milik Supabase (PostgREST) tidak dapat membaca atau
-- menulis tabel ini secara langsung.
-- ============================================================
alter table profiles enable row level security;
alter table sessions enable row level security;
alter table products enable row level security;
alter table stock_transactions enable row level security;
alter table audit_logs enable row level security;
alter table settings enable row level security;

insert into settings (key, value)
values ('schema_version', 'pg-1')
on conflict (key) do update set value = excluded.value;
