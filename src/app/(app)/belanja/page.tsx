import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { RestockActions } from "@/components/shopping/RestockActions";
import { RestockPrintArea } from "@/components/shopping/RestockPrintArea";
import { requireUser } from "@/lib/auth";
import { getRestockList } from "@/lib/data";
import { getSettings } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Daftar Belanja" };

export default async function BelanjaPage() {
  await requireUser();
  const [rows, settings] = await Promise.all([getRestockList(), getSettings()]);

  const today = formatDate(new Date().toISOString());
  const lines = rows.map(
    (row, index) => `${index + 1}. ${row.name} — ${row.recommended} ${row.unit}`,
  );
  const shareText = [
    "DAFTAR BELANJA TOKO",
    settings.store_name + (settings.store_phone ? ` (${settings.store_phone})` : ""),
    "",
    ...(rows.length > 0 ? lines : ["Tidak ada barang yang perlu dibeli."]),
    "",
    "Mohon disiapkan untuk kebutuhan stok toko.",
  ].join("\n");

  return (
    <div>
      <PageHeader
        title="Daftar Belanja"
        description="Barang berstatus menipis atau habis, lengkap dengan rekomendasi jumlah pembelian."
      />

      {rows.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ok-bg text-ok">
            <Icon name="check" size={22} />
          </span>
          <p className="text-sm font-bold">Tidak ada yang perlu dibeli</p>
          <p className="max-w-sm text-xs text-muted">
            Semua stok berada di atas batas minimum. Daftar ini diperbarui otomatis setiap kali ada
            transaksi barang masuk atau keluar.
          </p>
          <Link href="/barang" className="btn-secondary btn-sm mt-2">
            <Icon name="box" size={15} /> Lihat daftar barang
          </Link>
        </div>
      ) : (
        <RestockPrintArea
          rows={rows}
          storeName={settings.store_name}
          storeAddress={settings.store_address}
          storePhone={settings.store_phone}
          dateLabel={today}
          actions={<RestockActions shareText={shareText} disabled={false} />}
        />
      )}

      {rows.length > 0 ? (
        <div className="no-print card mt-4 p-4">
          <h2 className="text-sm font-bold">Pratinjau pesan WhatsApp</h2>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-xl bg-cream px-3.5 py-3 text-xs leading-relaxed text-ink">
            {shareText}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
