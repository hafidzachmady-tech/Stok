"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { saveSettingsAction } from "@/lib/actions/settings";
import type { ActionResult } from "@/lib/types";
import { Icon } from "@/components/Icon";
import { useActionToast } from "@/components/Toast";

export function SettingsForm({
  settings,
}: {
  settings: {
    store_name: string;
    store_address: string;
    store_phone: string;
    default_minimum_stock: string;
  };
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    saveSettingsAction,
    null,
  );
  useActionToast(state, () => router.refresh());

  return (
    <form action={formAction} className="card p-4 sm:p-5">
      <h2 className="text-base font-bold">Informasi Toko</h2>
      <p className="mt-0.5 text-xs text-muted">
        Nama toko tampil pada aplikasi dan daftar belanja yang dibagikan.
      </p>

      {state && !state.ok ? (
        <div
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-xl border border-danger-line bg-danger-bg px-3.5 py-2.5 text-sm text-danger"
        >
          <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
          {state.error}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="store_name">
            Nama toko <span className="text-danger">*</span>
          </label>
          <input
            id="store_name"
            name="store_name"
            defaultValue={settings.store_name}
            required
            maxLength={80}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="store_phone">
            Nomor telepon / WhatsApp
          </label>
          <input
            id="store_phone"
            name="store_phone"
            defaultValue={settings.store_phone}
            maxLength={30}
            placeholder="cth. 0812xxxxxxx"
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="default_minimum_stock">
            Batas minimum stok default
          </label>
          <input
            id="default_minimum_stock"
            name="default_minimum_stock"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            defaultValue={settings.default_minimum_stock}
            className="input"
          />
          <p className="hint">Dipakai sebagai nilai awal saat menambah barang baru.</p>
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="store_address">
            Alamat toko
          </label>
          <textarea
            id="store_address"
            name="store_address"
            rows={2}
            maxLength={200}
            defaultValue={settings.store_address}
            placeholder="cth. Jl. Merdeka No. 12, Bandung"
            className="input resize-none"
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Menyimpan…" : "Simpan pengaturan"}
        </button>
      </div>
    </form>
  );
}
