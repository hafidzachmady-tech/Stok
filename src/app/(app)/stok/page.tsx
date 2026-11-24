import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { TypeBadge } from "@/components/StatusBadge";
import { StockForm } from "@/components/stock/StockForm";
import { requireUser } from "@/lib/auth";
import { getProductOptions, getTransactions } from "@/lib/data";
import { formatDateTime, formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Catat Stok" };

export default async function StokPage({
  searchParams,
}: {
  searchParams: Promise<{ jenis?: string }>;
}) {
  await requireUser();
  const params = await searchParams;
  const type = params.jenis === "keluar" ? "keluar" : "masuk";

  const [products, recent] = await Promise.all([
    getProductOptions(),
    getTransactions({ jenis: type, limit: 6 }),
  ]);

  return (
    <div>
      <PageHeader
        title="Catat Stok"
        description="Catat barang masuk dan keluar. Stok diperbarui otomatis oleh sistem."
      />

      <div className="mb-4 flex gap-1 rounded-xl border border-line bg-white p-1">
        {[
          { key: "masuk", label: "Barang Masuk", icon: "arrow-down" as const },
          { key: "keluar", label: "Barang Keluar", icon: "arrow-up" as const },
        ].map((tab) => {
          const active = type === tab.key;
          return (
            <Link
              key={tab.key}
              href={`/stok?jenis=${tab.key}`}
              scroll={false}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition ${
                active
                  ? tab.key === "masuk"
                    ? "bg-brand-700 text-white"
                    : "bg-warn text-white"
                  : "text-muted hover:bg-cream"
              }`}
            >
              <Icon name={tab.icon} size={17} />
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {products.length === 0 ? (
            <div className="card flex flex-col items-center gap-2 px-6 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cream-200 text-muted">
                <Icon name="box" size={22} />
              </span>
              <p className="text-sm font-bold">Belum ada barang</p>
              <p className="max-w-sm text-xs text-muted">
                Tambahkan barang terlebih dahulu agar transaksi stok dapat dicatat.
              </p>
              <Link href="/barang" className="btn-primary btn-sm mt-2">
                Ke Daftar Barang
              </Link>
            </div>
          ) : (
            <StockForm products={products} type={type} />
          )}
        </div>

        <div className="space-y-4 lg:col-span-2">
          <section className="card">
            <div className="border-b border-line px-4 py-3.5">
              <h2 className="text-sm font-bold">
                {type === "masuk" ? "Barang masuk terakhir" : "Barang keluar terakhir"}
              </h2>
            </div>
            {recent.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-muted">
                Belum ada transaksi {type}. Transaksi yang disimpan akan muncul di sini.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {recent.map((item) => (
                  <li key={item.id} className="px-4 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="min-w-0 truncate text-sm font-semibold">{item.product_name}</p>
                      <TypeBadge type={item.transaction_type} />
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatNumber(item.quantity)} · stok {item.stock_before} → {item.stock_after}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted/80">
                      {formatDateTime(item.created_at)} · {item.user_name}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href={`/riwayat?jenis=${type}`}
              className="block border-t border-line px-4 py-3 text-center text-xs font-semibold text-brand-700 hover:bg-cream/60"
            >
              Lihat semua riwayat
            </Link>
          </section>

          <section className="card p-4">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <Icon name="shield" size={16} className="text-brand-700" />
              Ketentuan transaksi
            </h2>
            <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted">
              <li>• Jumlah harus lebih dari nol.</li>
              <li>• Stok tidak boleh menjadi negatif.</li>
              <li>• Transaksi keluar melebihi stok akan ditolak.</li>
              <li>• Setiap transaksi mencatat pengguna dan waktu secara otomatis.</li>
              <li>• Jika terjadi kesalahan, admin dapat melakukan koreksi dari halaman Riwayat Stok.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
