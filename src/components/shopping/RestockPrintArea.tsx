import { formatNumber } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import type { ReactNode } from "react";

export type RestockRow = {
  id: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  minimum_stock: number;
  recommended: number;
  status: "menipis" | "habis";
};

export function RestockPrintArea({
  rows,
  storeName,
  storeAddress,
  storePhone,
  dateLabel,
  actions,
}: {
  rows: RestockRow[];
  storeName: string;
  storeAddress: string;
  storePhone: string;
  dateLabel: string;
  actions: ReactNode;
}) {
  return (
    <section className="card print-area overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-line px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <div>
          <h2 className="text-base font-bold">Daftar Belanja Ulang</h2>
          <p className="mt-0.5 text-xs text-muted">
            {storeName}
            {storeAddress ? ` · ${storeAddress}` : ""}
            {storePhone ? ` · ${storePhone}` : ""}
          </p>
          <p className="mt-0.5 text-xs text-muted">Disusun {dateLabel}</p>
        </div>
        {actions}
      </div>

      <div className="hidden md:block">
        <table className="w-full border-collapse">
          <thead className="bg-cream/70">
            <tr>
              <th className="th">No</th>
              <th className="th">Nama Barang</th>
              <th className="th">Kategori</th>
              <th className="th text-right">Stok</th>
              <th className="th text-right">Min.</th>
              <th className="th text-right">Rekomendasi Beli</th>
              <th className="th">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row, index) => (
              <tr key={row.id}>
                <td className="td text-muted">{index + 1}</td>
                <td className="td font-semibold">{row.name}</td>
                <td className="td text-muted">{row.category}</td>
                <td className="td text-right tabular-nums">
                  {formatNumber(row.stock)} {row.unit}
                </td>
                <td className="td text-right tabular-nums text-muted">{formatNumber(row.minimum_stock)}</td>
                <td className="td text-right font-bold tabular-nums text-brand-800">
                  {formatNumber(row.recommended)} {row.unit}
                </td>
                <td className="td">
                  <StatusBadge stock={row.stock} minimum={row.minimum_stock} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-line md:hidden">
        {rows.map((row, index) => (
          <li key={row.id} className="px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold">
                {index + 1}. {row.name}
              </p>
              <StatusBadge stock={row.stock} minimum={row.minimum_stock} />
            </div>
            <p className="mt-1 text-xs text-muted">
              {row.category} · stok {formatNumber(row.stock)} {row.unit} · min{" "}
              {formatNumber(row.minimum_stock)} · beli{" "}
              <span className="font-semibold text-brand-800">
                {formatNumber(row.recommended)} {row.unit}
              </span>
            </p>
          </li>
        ))}
      </ul>

      <p className="border-t border-line px-4 py-3 text-xs text-muted sm:px-5">
        Rekomendasi pembelian = (2 × batas minimum) − stok saat ini. Sesuaikan dengan kondisi toko.
      </p>
    </section>
  );
}
