import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { Icon } from "@/components/Icon";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { isDemoMode } from "@/lib/seed";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Masuk" };

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/beranda");

  const demoMode = await isDemoMode();

  // Deteksi database yang belum memiliki akun sama sekali (provisioning belum
  // dijalankan pada deployment produksi) agar admin tidak menemui jalan buntu.
  let needsSetup = false;
  if (!demoMode) {
    try {
      const db = await getDb();
      const row = await db.prepare("SELECT COUNT(*) AS n FROM profiles").first<{ n: number }>();
      needsSetup = (row?.n ?? 0) === 0;
    } catch {
      needsSetup = false;
    }
  }

  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      <section className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-brand-800 p-10 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-600/60 blur-2xl" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-brand-900/60 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
              <Icon name="store" size={24} />
            </span>
            <div>
              <p className="text-lg font-extrabold tracking-tight">TokoKelontong</p>
              <p className="text-sm text-brand-100">Dashboard Stok Toko Kelontong</p>
            </div>
          </div>

          <h1 className="mt-16 max-w-md text-4xl font-extrabold leading-tight">
            Kelola stok toko tanpa repot, langsung dari HP.
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-brand-100">
            Catat barang masuk dan keluar, pantau stok menipis, dan susun daftar belanja ulang
            dalam satu aplikasi sederhana.
          </p>

          <ul className="mt-10 space-y-3 text-sm">
            {[
              "Stok diperbarui otomatis setiap transaksi",
              "Peringatan stok menipis dan habis",
              "Daftar belanja siap dibagikan ke WhatsApp",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                  <Icon name="check" size={14} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-brand-200">
          Akses dibatasi sesuai peran pengguna. Seluruh transaksi stok tercatat dan dapat diaudit.
        </p>
      </section>

      <section className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-700 text-white">
              <Icon name="store" size={24} />
            </span>
            <div>
              <p className="text-lg font-extrabold tracking-tight">TokoKelontong</p>
              <p className="text-sm text-muted">Dashboard Stok Toko Kelontong</p>
            </div>
          </div>

          <div className="card p-6 sm:p-8">
            <h2 className="text-xl font-extrabold tracking-tight">Masuk ke dashboard</h2>
            <p className="mt-1 mb-6 text-sm text-muted">
              Gunakan akun yang diberikan admin toko.
            </p>
            {needsSetup ? (
              <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-warn-line bg-warn-bg px-3.5 py-3 text-sm text-warn">
                <Icon name="alert" size={18} className="mt-0.5 shrink-0" />
                <span>
                  Database belum memiliki akun. Atur environment variable <b>ADMIN_USERNAME</b> dan{" "}
                  <b>ADMIN_PASSWORD</b> pada deployment, lalu buka kembali halaman ini.
                </span>
              </div>
            ) : null}
            <LoginForm demoMode={demoMode} />
          </div>

          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted">
            <Icon name="shield" size={14} />
            Sesi login diamankan dengan cookie httpOnly.
          </p>
        </div>
      </section>
    </main>
  );
}
