import type { Metadata } from "next";
import Link from "next/link";
import { CorrectionModal } from "@/components/history/CorrectionModal";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { TypeBadge } from "@/components/StatusBadge";
import { requireUser } from "@/lib/auth";
import { getProductOptions, getTransactions } from "@/lib/data";
import { isValidDayKey } from "@/lib/date";
import { formatDateTime, formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Riwayat Stok" };

export default async function RiwayatPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; jenis?: string; dari?: string; sampai?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;

  const jenis = ["masuk", "keluar", "koreksi"].includes(params.jenis ?? "") ? params.jenis ?? "" : "";
  const filters = {
    q: (params.q ?? "").slice(0, 100),
    jenis,
    dari: isValidDayKey(params.dari) ? params.dari : undefined,
    sampai: isValidDayKey(params.sampai) ? params.sampai : undefined,
  };
  const hasFilter = Boolean(filters.q || filters.jenis || filters.dari || filters.sampai);

  const [transactions, products] = await Promise.all([
    getTransactions(filters),
    user.role === "admin" ? getProductOptions() : Promise.resolve([]),
  ]);

  return (
    <div>
      <PageHeader
        title="Riwayat Stok"
        description="Seluruh transaksi persediaan, terbaru lebih dulu. Data tersimpan permanen di database."
        actions={
          user.role === "admin" ? (
            <CorrectionModal products={products.map((p) => ({
              id: p.id,
              product_code: p.product_code,
              name: p.name,
              unit: p.unit,
              stock: p.stock,
            }))} />
          ) : null
        }
      />

      <form method="GET" className="card mb-4 p-3 sm:p-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
              <Icon name="search" size={18} />
            </span>
            <input
              type="search"
              name="q"
              defaultValue={filters.q}
              placeholder="Cari nama atau kode barang…"
              className="input pl-11"
              aria-label="Cari barang pada riwayat"
            />
          </div>
          <select name="jenis" defaultValue={filters.jenis} className="input" aria-label="Filter jenis transaksi">
            <option value="">Semua jenis</option>
            <option value="masuk">Barang masuk</option>
            <option value="keluar">Barang keluar</option>
            <option value="koreksi">Koreksi</option>
          </select>
          <div>
            <label className="sr-only" htmlFor="dari">
              Dari tanggal
            </label>
            <input
              id="dari"
              type="date"
              name="dari"
              defaultValue={filters.dari ?? ""}
              className="input"
              aria-label="Dari tanggal"
            />
          </div>
          <div>
            <label className="sr-only" htmlFor="sampai">
              Sampai tanggal
            </label>
            <input
              id="sampai"
              type="date"
              name="sampai"
              defaultValue={filters.sampai ?? ""}
              className="input"
              aria-label="Sampai tanggal"
            />
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 px-1 text-xs text-muted">
          <span>
            {formatNumber(transactions.length)} transaksi ditampilkan
            {hasFilter ? " sesuai filter" : ""}
          </span>
          <div className="flex items-center gap-3">
            {hasFilter ? (
              <Link href="/riwayat" className="font-semibold text-brand-700 hover:underline">
                Reset
              </Link>
            ) : null}
            <button type="submit" className="btn-primary btn-sm">
              <Icon name="filter" size={14} /> Terapkan
            </button>
          </div>
        </div>
      </form>

      {transactions.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cream-200 text-muted">
            <Icon name="history" size={22} />
          </span>
          <p className="text-sm font-bold">
            {hasFilter ? "Tidak ada transaksi yang cocok" : "Belum ada transaksi"}
          </p>
          <p className="max-w-sm text-xs text-muted">
            {hasFilter
              ? "Ubah kata kunci atau rentang tanggal, lalu terapkan kembali."
              : "Transaksi barang masuk dan keluar akan tercatat di sini secara otomatis."}
          </p>
          <Link href="/stok" className="btn-primary btn-sm mt-2">
            Catat stok sekarang
          </Link>
        </div>
      ) : (
        <>
          <div className="card hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse">
                <thead className="bg-cream/70">
                  <tr>
                    <th className="th">Tanggal &amp; waktu</th>
                    <th className="th">Barang</th>
                    <th className="th">Jenis</th>
                    <th className="th text-right">Jumlah</th>
                    <th className="th text-right">Stok sebelum</th>
                    <th className="th text-right">Stok sesudah</th>
                    <th className="th">Catatan</th>
                    <th className="th">Pengguna</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {transactions.map((item) => (
                    <tr key={item.id} className="hover:bg-cream/40">
                      <td className="td whitespace-nowrap text-muted">{formatDateTime(item.created_at)}</td>
                      <td className="td">
                        <p className="font-semibold">{item.product_name}</p>
                        <p className="font-mono text-[11px] text-muted">{item.product_code}</p>
                      </td>
                      <td className="td">
                        <TypeBadge type={item.transaction_type} />
                      </td>
                      <td className="td text-right font-semibold tabular-nums">
                        {item.transaction_type === "keluar" ? "−" : "+"}
                        {formatNumber(item.quantity)}
                      </td>
                      <td className="td text-right tabular-nums text-muted">
                        {formatNumber(item.stock_before)}
                      </td>
                      <td className="td text-right font-semibold tabular-nums">
                        {formatNumber(item.stock_after)}
                      </td>
                      <td className="td max-w-[220px] truncate text-muted">{item.note || "—"}</td>
                      <td className="td whitespace-nowrap text-muted">{item.user_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-2.5 md:hidden">
            {transactions.map((item) => (
              <div key={item.id} className="card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{item.product_name}</p>
                    <p className="text-[11px] text-muted">{formatDateTime(item.created_at)}</p>
                  </div>
                  <TypeBadge type={item.transaction_type} />
                </div>
                <div className="mt-2 flex items-center justify-between rounded-xl bg-cream px-3 py-2 text-xs">
                  <span className="font-semibold tabular-nums">
                    {item.transaction_type === "keluar" ? "−" : "+"}
                    {formatNumber(item.quantity)} unit
                  </span>
                  <span className="text-muted tabular-nums">
                    {formatNumber(item.stock_before)} → {formatNumber(item.stock_after)}
                  </span>
                </div>
                {item.note ? <p className="mt-1.5 text-xs text-muted">{item.note}</p> : null}
                <p className="mt-1 text-[11px] text-muted/80">Dicatat oleh {item.user_name}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="mt-4 flex items-start gap-2 rounded-xl border border-line bg-white px-4 py-3 text-xs leading-relaxed text-muted">
        <Icon name="shield" size={15} className="mt-0.5 shrink-0 text-brand-700" />
        Transaksi yang sudah tersimpan tidak dapat diubah atau dihapus. Jika ada kesalahan, admin dapat
        melakukan koreksi stok yang tetap tercatat di riwayat sebagai jejak audit.
      </p>
    </div>
  );
}
