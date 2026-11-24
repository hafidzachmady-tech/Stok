"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { recordStockAction } from "@/lib/actions/stock";
import { formatNumber } from "@/lib/format";
import type { ActionResult } from "@/lib/types";
import { Icon } from "@/components/Icon";
import { useActionToast } from "@/components/Toast";

type Option = {
  id: string;
  product_code: string;
  name: string;
  unit: string;
  stock: number;
  minimum_stock: number;
};

const QUICK = [1, 5, 10, 20];

export function StockForm({ products, type }: { products: Option[]; type: "masuk" | "keluar" }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    recordStockAction,
    null,
  );
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [quantity, setQuantity] = useState("");
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      setQuantity("");
      if (noteRef.current) noteRef.current.value = "";
      router.refresh();
    }
  }, [state, router]);

  useActionToast(state);

  const selected = products.find((product) => product.id === productId) ?? null;
  const qty = Number(quantity);
  const validQty = Number.isFinite(qty) && qty > 0 ? Math.floor(qty) : 0;
  const after = selected ? (type === "masuk" ? selected.stock + validQty : selected.stock - validQty) : 0;
  const insufficient = type === "keluar" && selected ? validQty > selected.stock : false;
  const isIn = type === "masuk";

  function addQuantity(amount: number) {
    const current = Number(quantity) || 0;
    setQuantity(String(current + amount));
  }

  return (
    <form ref={formRef} action={formAction} className="card p-4 sm:p-5">
      <input type="hidden" name="transaction_type" value={type} />

      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            isIn ? "bg-ok-bg text-ok" : "bg-warn-bg text-warn"
          }`}
        >
          <Icon name={isIn ? "arrow-down" : "arrow-up"} size={20} />
        </span>
        <div>
          <h2 className="text-base font-bold">{isIn ? "Catat Barang Masuk" : "Catat Barang Keluar"}</h2>
          <p className="text-xs text-muted">
            {isIn ? "Stok bertambah otomatis setelah disimpan." : "Stok berkurang otomatis setelah disimpan."}
          </p>
        </div>
      </div>

      {state && !state.ok ? (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-xl border border-danger-line bg-danger-bg px-3.5 py-2.5 text-sm text-danger"
        >
          <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
          <span>{state.error}</span>
        </div>
      ) : null}

      <div className="mt-4 space-y-4">
        <div>
          <label className="label" htmlFor="product_id">
            Pilih barang <span className="text-danger">*</span>
          </label>
          <select
            id="product_id"
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
                {product.name} ({product.product_code}) — stok {product.stock} {product.unit}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="quantity">
            Jumlah {isIn ? "masuk" : "keluar"} <span className="text-danger">*</span>
          </label>
          <div className="flex items-stretch gap-2">
            <input
              id="quantity"
              name="quantity"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="0"
              required
              className="input text-lg font-semibold"
            />
            <span className="flex items-center rounded-xl bg-cream px-3 text-sm text-muted">
              {selected?.unit ?? "unit"}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {QUICK.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => addQuantity(amount)}
                className="btn-secondary btn-sm min-w-14 tabular-nums"
              >
                +{amount}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setQuantity("")}
              className="btn-ghost btn-sm ml-auto"
            >
              Kosongkan
            </button>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="note">
            Catatan <span className="font-normal text-muted">(opsional)</span>
          </label>
          <textarea
            id="note"
            name="note"
            ref={noteRef}
            rows={2}
            maxLength={300}
            placeholder={isIn ? "cth. Kulakan dari supplier" : "cth. Penjualan harian"}
            className="input resize-none"
          />
        </div>

        {selected ? (
          <div className="rounded-xl border border-line bg-cream px-3.5 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Pratinjau stok</p>
            <div className="mt-1.5 flex items-center gap-2 text-sm">
              <span className="tabular-nums">{formatNumber(selected.stock)}</span>
              <Icon name="arrow-up" size={14} className="rotate-90 text-muted" />
              <span
                className={`font-bold tabular-nums ${
                  insufficient ? "text-danger" : isIn ? "text-ok" : "text-warn"
                }`}
              >
                {formatNumber(Math.max(0, after))} {selected.unit}
              </span>
              {insufficient ? (
                <span className="ml-auto text-xs font-semibold text-danger">Stok tidak mencukupi</span>
              ) : null}
            </div>
          </div>
        ) : null}

        <button type="submit" className="btn-primary w-full" disabled={pending || insufficient || !productId}>
          {pending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Menyimpan…
            </>
          ) : (
            <>
              <Icon name="check" size={17} />
              Simpan {isIn ? "barang masuk" : "barang keluar"}
            </>
          )}
        </button>
        <p className="text-center text-xs text-muted">
          Tanggal dan waktu tercatat otomatis. Transaksi tidak dapat diubah setelah disimpan.
        </p>
      </div>
    </form>
  );
}
