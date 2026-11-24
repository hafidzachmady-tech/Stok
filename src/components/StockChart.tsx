import Link from "next/link";
import { formatNumber } from "@/lib/format";
import type { StockChartData } from "@/lib/types";

const PERIODS = [
  { key: "7", label: "7 hari terakhir" },
  { key: "30", label: "30 hari terakhir" },
  { key: "bulan", label: "Bulan ini" },
];

export function StockChart({
  data,
  period,
  basePath = "/beranda",
}: {
  data: StockChartData;
  period: string;
  basePath?: string;
}) {
  const max = Math.max(1, ...data.masuk, ...data.keluar);
  const totalMasuk = data.masuk.reduce((acc, value) => acc + value, 0);
  const totalKeluar = data.keluar.reduce((acc, value) => acc + value, 0);
  const hasData = totalMasuk > 0 || totalKeluar > 0;
  const dense = data.labels.length > 14;

  return (
    <section className="card p-4 sm:p-5" aria-label="Grafik perubahan stok">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-ink">Perubahan Stok</h2>
          <p className="mt-0.5 text-xs text-muted">
            Total masuk {formatNumber(totalMasuk)} unit · keluar {formatNumber(totalKeluar)} unit
          </p>
        </div>
        <div className="no-print flex flex-wrap gap-1 rounded-xl bg-cream p-1">
          {PERIODS.map((item) => (
            <Link
              key={item.key}
              href={`${basePath}?periode=${item.key}`}
              scroll={false}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                period === item.key ? "bg-white text-brand-800 shadow-sm" : "text-muted hover:text-ink"
              }`}
              aria-current={period === item.key ? "true" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-brand-600" /> Masuk
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#e0a11b]" /> Keluar
        </span>
      </div>

      <div className="mt-3 overflow-x-auto pb-1">
        <div
          className="flex items-end gap-2"
          style={{ minWidth: dense ? `${data.labels.length * 26}px` : "100%" }}
        >
          {data.labels.map((label, index) => {
            const masuk = data.masuk[index] ?? 0;
            const keluar = data.keluar[index] ?? 0;
            const showLabel = !dense || index % 5 === 0 || index === data.labels.length - 1;
            return (
              <div key={`${label}-${index}`} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="flex h-[168px] w-full items-end justify-center gap-[3px]"
                  title={`${data.fullLabels[index]} — masuk ${masuk}, keluar ${keluar}`}
                >
                  <div
                    className="w-2.5 rounded-t-sm bg-brand-600 transition-all sm:w-3"
                    style={{ height: `${Math.max(masuk > 0 ? 6 : 2, (masuk / max) * 100)}%` }}
                    aria-label={`Masuk ${masuk}`}
                  />
                  <div
                    className="w-2.5 rounded-t-sm bg-[#e0a11b] transition-all sm:w-3"
                    style={{ height: `${Math.max(keluar > 0 ? 6 : 2, (keluar / max) * 100)}%` }}
                    aria-label={`Keluar ${keluar}`}
                  />
                </div>
                <span className="h-4 whitespace-nowrap text-[10px] text-muted">
                  {showLabel ? label : ""}
                </span>
              </div>
            );
          })}
        </div>
        {!hasData ? (
          <p className="rounded-xl bg-cream px-3 py-2 text-center text-xs text-muted">
            Belum ada transaksi pada periode ini.
          </p>
        ) : null}
      </div>
    </section>
  );
}
