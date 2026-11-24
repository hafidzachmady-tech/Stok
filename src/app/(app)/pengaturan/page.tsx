import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { DemoDataCard } from "@/components/settings/DemoDataCard";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { requireAdmin } from "@/lib/auth";
import { getAuditLogs, getDashboardStats } from "@/lib/data";
import { getSettings } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Pengaturan" };

export default async function PengaturanPage() {
  await requireAdmin();
  const [settings, stats, logs] = await Promise.all([
    getSettings(),
    getDashboardStats(),
    getAuditLogs(40),
  ]);

  return (
    <div>
      <PageHeader
        title="Pengaturan"
        description="Atur informasi toko, batas minimum stok, dan lihat aktivitas pengguna."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SettingsForm settings={settings} />
        </div>
        <div className="space-y-4">
          <DemoDataCard canLoad={stats.totalBarang === 0} />

          <div className="card p-4 sm:p-5">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <Icon name="shield" size={17} className="text-brand-700" />
              Keamanan
            </h2>
            <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted">
              <li>• Password disimpan sebagai hash PBKDF2-SHA256, tidak pernah ditampilkan.</li>
              <li>• Sesi login memakai cookie httpOnly yang kedaluwarsa dalam 7 hari.</li>
              <li>• Akses admin dan penjaga diperiksa di server pada setiap permintaan.</li>
              <li>• 5 kali percobaan login gagal mengunci akun selama 15 menit.</li>
              <li>• Akun demo admin/admin hanya dibuat di lingkungan demo/pengembangan.</li>
            </ul>
          </div>
        </div>
      </div>

      <section className="card mt-4">
        <div className="border-b border-line px-4 py-3.5 sm:px-5">
          <h2 className="text-base font-bold">Aktivitas Pengguna</h2>
          <p className="mt-0.5 text-xs text-muted">
            40 aktivitas terakhir: login, perubahan barang, transaksi stok, dan pengelolaan akun.
          </p>
        </div>
        {logs.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">Belum ada aktivitas tercatat.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead className="bg-cream/70">
                <tr>
                  <th className="th">Waktu</th>
                  <th className="th">Pengguna</th>
                  <th className="th">Aksi</th>
                  <th className="th">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="td whitespace-nowrap text-muted">{formatDateTime(log.created_at)}</td>
                    <td className="td whitespace-nowrap font-semibold">{log.user_name}</td>
                    <td className="td">
                      <span className="rounded-md bg-cream-200 px-2 py-0.5 font-mono text-[11px] text-muted">
                        {log.action}
                      </span>
                    </td>
                    <td className="td text-muted">{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
