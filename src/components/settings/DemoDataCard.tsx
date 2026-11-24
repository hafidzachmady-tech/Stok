"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loadDemoDataAction } from "@/lib/actions/settings";
import { Icon } from "@/components/Icon";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";

export function DemoDataCard({ canLoad }: { canLoad: boolean }) {
  const router = useRouter();
  const { notify } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function load() {
    startTransition(async () => {
      const result = await loadDemoDataAction();
      setConfirmOpen(false);
      if (result.ok) {
        notify(result.message ?? "Data contoh dimuat.", "success");
        router.refresh();
      } else {
        notify(result.error, "error");
      }
    });
  }

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-800">
          <Icon name="sparkles" size={18} />
        </span>
        <div>
          <h2 className="text-base font-bold">Data Contoh</h2>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">
            Data contoh hanya dimuat jika Anda menekan tombol di bawah. Database produksi tidak pernah
            diisi data contoh secara otomatis.
          </p>
        </div>
      </div>

      {canLoad ? (
        <button type="button" onClick={() => setConfirmOpen(true)} className="btn-secondary mt-4 w-full">
          Muat data contoh
        </button>
      ) : (
        <p className="mt-4 rounded-xl bg-cream px-3.5 py-2.5 text-xs text-muted">
          Data contoh hanya dapat dimuat saat daftar barang masih kosong. Saat ini sudah ada data barang
          aktif di toko Anda.
        </p>
      )}

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Muat data contoh?"
        description="10 barang contoh beserta riwayat transaksi akan ditambahkan."
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setConfirmOpen(false)}>
              Batal
            </button>
            <button type="button" className="btn-primary" onClick={load} disabled={pending}>
              {pending ? "Memuat…" : "Ya, muat data contoh"}
            </button>
          </>
        }
      >
        <p className="text-sm text-muted">
          Data contoh berguna untuk mencoba aplikasi. Anda tetap dapat menghapus barang contoh satu per
          satu setelahnya. Pastikan ini bukan database produksi yang sudah berisi data asli.
        </p>
      </Modal>
    </div>
  );
}
