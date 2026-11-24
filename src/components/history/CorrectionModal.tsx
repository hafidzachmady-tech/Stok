"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { correctStockAction } from "@/lib/actions/stock";
import { formatNumber } from "@/lib/format";
import type { ActionResult } from "@/lib/types";
import { Icon } from "@/components/Icon";
import { Modal } from "@/components/Modal";
import { useActionToast } from "@/components/Toast";

type Option = {
  id: string;
  product_code: string;
  name: string;
  unit: string;
  stock: number;
};

export function CorrectionModal({ products }: { products: Option[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    correctStockAction,
    null,
  );

  useActionToast(state, () => {
    setOpen(false);
    setProductId("");
    router.refresh();
  });

  const selected = products.find((product) => product.id === productId) ?? null;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-secondary">
        <Icon name="edit" size={16} />
        Koreksi Stok
      </button>

      {open ? (
        <Modal
          open
          onClose={() => setOpen(false)}
          title="Koreksi stok"
          description="Gunakan hanya jika ada kesalahan pencatatan. Koreksi tetap tersimpan di riwayat."
          footer={
            <>
              <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
                Batal
              </button>
              <button type="submit" form="correction-form" className="btn-primary" disabled={pending}>
                {pending ? "Menyimpan…" : "Simpan koreksi"}
              </button>
            </>
          }
        >
          <form id="correction-form" action={formAction} className="space-y-4">
            {state && !state.ok ? (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-danger-line bg-danger-bg px-3.5 py-2.5 text-sm text-danger"
              >
                <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
                {state.error}
              </div>
            ) : null}

            <div>
              <label className="label" htmlFor="correction-product">
                Barang <span className="text-danger">*</span>
              </label>
              <select
                id="correction-product"
                name="product_id"
                value={productId}
                onChange={(event) => setProductId(event.target.value)}
                required
                className="input"
              >
                <option value="" disabled>
                  Pilih barang…
                </option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.product_code}) — stok {product.stock}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="correction-stock">
                Stok seharusnya <span className="text-danger">*</span>
              </label>
              <div className="flex items-stretch gap-2">
                <input
                  id="correction-stock"
                  name="new_stock"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  required
                  defaultValue={selected?.stock ?? ""}
                  key={selected?.id ?? "none"}
                  className="input"
                />
                <span className="flex items-center rounded-xl bg-cream px-3 text-sm text-muted">
                  {selected?.unit ?? "unit"}
                </span>
              </div>
              {selected ? (
                <p className="hint">Stok tercatat saat ini {formatNumber(selected.stock)} {selected.unit}.</p>
              ) : null}
            </div>

            <div>
              <label className="label" htmlFor="correction-note">
                Alasan koreksi <span className="text-danger">*</span>
              </label>
              <textarea
                id="correction-note"
                name="note"
                rows={3}
                required
                maxLength={300}
                placeholder="cth. Salah input jumlah barang masuk"
                className="input resize-none"
              />
            </div>
          </form>
        </Modal>
      ) : null}
    </>
  );
}
