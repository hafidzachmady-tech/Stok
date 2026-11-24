import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { StatCard } from "@/components/StatCard";
import { StockChart } from "@/components/StockChart";
import { StatusBadge, TypeBadge } from "@/components/StatusBadge";
import { requireUser } from "@/lib/auth";
import {
  chartRange,
  getDashboardStats,
  getLowStockProducts,
  getRecentActivity,
  getRecentAuditLogs,
  getStockChart,
  type ChartPeriod,
} from "@/lib/data";
import { formatNumber, formatRelative } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Beranda" };

const VALID_PERIODS: ChartPeriod[] = ["7", "30", "bulan"];

export default async function BerandaPage({
  searchParams,
}: {
  searchParams: Promise<{ periode?: string; akses?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const period = (VALID_PERIODS.includes((params.periode ?? "") as ChartPeriod)
    ? params.periode
    : "7") as ChartPeriod;

  const [stats, chart, alerts, activity, audit] = await Promise.all([
    getDashboardStats(),
    getStockChart(period),
    getLowStockProducts(6),
    getRecentActivity(6),
    user.role === "admin" ? getRecentAuditLogs(5) : Promise.resolve([]),
  ]);

  const firstName = user.full_name.split(" ")[0] || user.full_name;
  const safe = stats.menipis + stats.habis;
  const { startKey, endKey } = chartRange(period);

  return (
    <div className="space-y-5">
      {params.akses === "ditolak" ? (
        <div className="flex items-start gap-3 rounded-xl border border-warn-line bg-warn-bg px-4 py-3 text-sm text-warn">
          <Icon name="alert" size={18} className="mt-0.5 shrink-0" />
          <p>
            Halaman tersebut hanya dapat diakses admin. Anda diarahkan kembali ke beranda sesuai
            hak akses penjaga toko.
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Selamat datang, {firstName}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {safe > 0
              ? `Ada ${safe} barang yang perlu segera diisi ulang.`
              : "Semua stok dalam kondisi aman. Kerja bagus!"}
          </p>
        </div>
        <div className="no-print flex flex-wrap gap-2">
          <Link href="/stok?jenis=masuk" className="btn-primary">
            <Icon name="arrow-down" size={17} />
            Barang Masuk
          </Link>
          <Link href="/stok?jenis=keluar" className="btn-secondary">
            <Icon name="arrow-up" size={17} />
            Barang Keluar
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total Barang"
          value={formatNumber(stats.totalBarang)}
          hint="Barang aktif terdaftar"
          icon="box"
          tone="brand"
        />
        <StatCard
          label="Total Stok"
          value={formatNumber(stats.totalStok)}
          hint="Seluruh unit tersedia"
          icon="swap"
          tone="neutral"
        />
        <StatCard
          label="Stok Menipis"
          value={formatNumber(stats.menipis)}
          hint="Perlu segera diisi ulang"
          icon="alert"
          tone="warn"
        />
        <StatCard
          label="Stok Habis"
          value={formatNumber(stats.habis)}
          hint="Stok sudah nol"
          icon="alert"
          tone="danger"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <StockChart data={chart} period={period} />
          <p className="mt-2 text-xs text-muted">
            Periode {startKey} s/d {endKey} (WIB)
          </p>
        </div>

        <section className="card flex flex-col p-4 sm:p-5" aria-label="Peringatan stok">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold">Peringatan Stok</h2>
            <Link href="/belanja" className="text-xs font-semibold text-brand-700 hover:underline">
              Lihat semua
            </Link>
          </div>
          {alerts.length === 0 ? (
            <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-2 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ok-bg text-ok">
                <Icon name="check" size={20} />
              </span>
              <p className="text-sm font-semibold">Semua stok aman</p>
              <p className="text-xs text-muted">Tidak ada barang yang menipis atau habis.</p>
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {alerts.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
                    <p className="text-xs text-muted">
                      Stok {formatNumber(item.stock)} {item.unit} · min {formatNumber(item.minimum_stock)}
                    </p>
                  </div>
                  <StatusBadge stock={item.stock} minimum={item.minimum_stock} />
                </li>
              ))}
            </ul>
          )}
          <Link href="/stok?jenis=masuk" className="btn-secondary btn-sm mt-3 w-full">
            <Icon name="plus" size={15} />
            Catat barang masuk
          </Link>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="card xl:col-span-2" aria-label="Aktivitas terbaru">
          <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3.5 sm:px-5">
            <h2 className="text-base font-bold">Aktivitas Terbaru</h2>
            <Link href="/riwayat" className="text-xs font-semibold text-brand-700 hover:underline">
              Lihat riwayat
            </Link>
          </div>
          {activity.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">
              Belum ada aktivitas stok. Mulai dengan mencatat barang masuk.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {activity.map((item) => (
                <li key={item.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      item.transaction_type === "masuk"
                        ? "bg-ok-bg text-ok"
                        : item.transaction_type === "keluar"
                          ? "bg-warn-bg text-warn"
                          : "bg-cream-200 text-muted"
                    }`}
                  >
                    <Icon
                      name={item.transaction_type === "masuk" ? "arrow-down" : "arrow-up"}
                      size={17}
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{item.product_name}</p>
                    <p className="truncate text-xs text-muted">
                      {item.transaction_type === "masuk" ? "+" : "−"}
                      {formatNumber(item.quantity)} · stok jadi {formatNumber(item.stock_after)} ·{" "}
                      {item.user_name}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted">{formatRelative(item.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card" aria-label="Log aktivitas pengguna">
          <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3.5 sm:px-5">
            <h2 className="text-base font-bold">Aktivitas Pengguna</h2>
            {user.role === "admin" ? (
              <Link href="/pengaturan" className="text-xs font-semibold text-brand-700 hover:underline">
                Detail
              </Link>
            ) : null}
          </div>
          {user.role !== "admin" ? (
            <p className="px-5 py-8 text-center text-xs text-muted">
              Log aktivitas pengguna hanya dapat dilihat admin.
            </p>
          ) : audit.length === 0 ? (
            <p className="px-5 py-8 text-center text-xs text-muted">Belum ada aktivitas tercatat.</p>
          ) : (
            <ul className="divide-y divide-line">
              {audit.map((log) => (
                <li key={log.id} className="px-4 py-2.5 sm:px-5">
                  <p className="text-xs font-semibold text-ink">{log.user_name}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">{log.description}</p>
                  <p className="mt-0.5 text-[11px] text-muted/80">{formatRelative(log.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-800">
            <Icon name="cart" size={19} />
          </span>
          <div>
            <p className="text-sm font-bold">Butuh belanja ulang?</p>
            <p className="text-xs text-muted">
              {safe > 0
                ? `${safe} barang masuk daftar belanja dengan rekomendasi jumlah pembelian.`
                : "Daftar belanja akan terisi otomatis saat stok menipis."}
            </p>
          </div>
        </div>
        <Link href="/belanja" className="btn-primary">
          Buka daftar belanja
        </Link>
      </div>
    </div>
  );
}
