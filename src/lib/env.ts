/**
 * Konfigurasi server. Seluruh nilai dibaca dari environment variable
 * (Vercel Project Settings -> Environment Variables). Tidak ada kredensial
 * database yang boleh masuk ke bundle browser.
 */
export function getDatabaseUrl(): string {
  const url =
    process.env.DATABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    "";
  if (!url) {
    throw new Error(
      "DATABASE_URL belum diatur. Tambahkan connection string Postgres (Supabase) pada environment variable.",
    );
  }
  return url;
}

export function hasDatabaseUrl(): boolean {
  try {
    getDatabaseUrl();
    return true;
  } catch {
    return false;
  }
}

/**
 * Mode demo: akun admin/admin beserta data contoh dibuat saat database masih
 * kosong. Hanya aktif bila DEMO_MODE=1 atau di lingkungan pengembangan.
 * Build produksi tidak pernah membuat akun demo.
 */
export function isDemoMode(): boolean {
  const flag = (process.env.DEMO_MODE || "").toLowerCase();
  if (flag === "1" || flag === "true" || flag === "yes") return true;
  if (flag === "0" || flag === "false" || flag === "no") return false;
  return process.env.NODE_ENV !== "production";
}
