"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProductAction, saveProductAction } from "@/lib/actions/products";
import { formatNumber, formatRupiah } from "@/lib/format";
import type { ActionResult, Product, Role } from "@/lib/types";
import { Icon } from "@/components/Icon";
import { Modal } from "@/components/Modal";
import { RoleBadge, StatusBadge } from "@/components/StatusBadge";
import { useActionToast, useToast } from "@/components/Toast";

const UNITS = ["pcs", "bungkus", "botol", "kg", "gram", "liter", "sachet", "karung", "box", "pak", "lusin"];

const SORT_OPTIONS = [
  { value: "nama-asc", label: "Nama A–Z" },
  { value: "nama-desc", label: "Nama Z–A" },
  { value: "stok-asc", label: "Stok terendah" },
  { value: "stok-desc", label: "Stok tertinggi" },
  { value: "harga-asc", label: "Harga termurah" },
  { value: "harga-desc", label: "Harga termahal" },
];

type Filters = {
  q: string;
  kategori: string;
  status: string;
  sort: string;
  dir: string;
};

export function ProductsView({
  products,
  categories,
  role,
  filters,
  totalAll,
  defaultMinimumStock,
}: {
  products: Product[];
  categories: string[];
  role: Role;
  filters: Filters;
  totalAll: number;
  defaultMinimumStock: number;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(filters.q);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [deletePending, startDelete] = useTransition();
  const { notify } = useToast();
  const isAdmin = role === "admin";

  const sortValue = `${filters.sort}-${filters.dir}`;

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.kategori) params.set("kategori", filters.kategori);
    if (filters.status) params.set("status", filters.status);
    if (filters.sort) params.set("sort", filters.sort);
    if (filters.dir) params.set("dir", filters.dir);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key === "q" && value) params.set("q", value);
    router.replace(`/barang?${params.toString()}`, { scroll: false });
  }

  // Pencarian dengan jeda agar tidak membanjiri server.
  useEffect(() => {
    if (query === filters.q) return;
    const timer = window.setTimeout(() => {
      updateParam("q", query);
    }, 400);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const activeFilters = Boolean(filters.q || filters.kategori || filters.status);
  const summary = useMemo(() => {
    if (activeFilters) return `${formatNumber(products.length)} barang sesuai filter`;
    return `${formatNumber(products.length)} barang aktif`;
  }, [products.length, activeFilters]);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setModalOpen(true);
  }

  function handleDelete() {
    if (!deleting) return;
    const target = deleting;
    startDelete(async () => {
      const result = await deleteProductAction(target.id);
      if (result.ok) {
        notify(result.message ?? "Barang dihapus.", "success");
        setDeleting(null);
        router.refresh();
      } else {
        notify(result.error, "error");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="card p-3 sm:p-4">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
              <Icon name="search" size={18} />
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari nama atau kode barang…"
              className="input pl-11"
              aria-label="Cari barang"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:w-auto">
            <select
              value={filters.kategori}
              onChange={(event) => updateParam("kategori", event.target.value)}
              className="input lg:w-40"
              aria-label="Filter kategori"
            >
              <option value="">Semua kategori</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(event) => updateParam("status", event.target.value)}
              className="input lg:w-36"
              aria-label="Filter status stok"
            >
              <option value="">Semua status</option>
              <option value="aman">Aman</option>
              <option value="menipis">Menipis</option>
              <option value="habis">Habis</option>
            </select>
            <select
              value={sortValue}
              onChange={(event) => {
                const [sort, dir] = event.target.value.split("-");
                const params = new URLSearchParams();
                if (filters.q) params.set("q", filters.q);
                if (filters.kategori) params.set("kategori", filters.kategori);
                if (filters.status) params.set("status", filters.status);
                params.set("sort", sort);
                params.set("dir", dir);
                router.replace(`/barang?${params.toString()}`, { scroll: false });
              }}
              className="input col-span-2 sm:col-span-1 lg:w-40"
              aria-label="Urutkan barang"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {isAdmin ? (
            <button type="button" onClick={openCreate} className="btn-primary shrink-0">
              <Icon name="plus" size={17} />
              Tambah Barang
            </button>
          ) : null}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 px-1 text-xs text-muted">
          <span>
            {summary}
            {activeFilters ? ` dari ${formatNumber(totalAll)} barang` : ""}
          </span>
          {activeFilters ? (
            <button
              type="button"
              onClick={() => router.replace("/barang", { scroll: false })}
              className="font-semibold text-brand-700 hover:underline"
            >
              Reset filter
            </button>
          ) : null}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cream-200 text-muted">
            <Icon name="box" size={22} />
          </span>
          <p className="text-sm font-bold">
            {activeFilters ? "Tidak ada barang yang cocok" : "Belum ada barang"}
          </p>
          <p className="max-w-sm text-xs text-muted">
            {activeFilters
              ? "Coba ubah kata kunci atau reset filter untuk melihat semua barang."
              : isAdmin
                ? "Tambahkan barang pertama toko Anda untuk mulai mencatat stok."
                : "Belum ada barang yang didaftarkan admin."}
          </p>
          {isAdmin && !activeFilters ? (
            <button type="button" onClick={openCreate} className="btn-primary btn-sm mt-2">
              <Icon name="plus" size={15} /> Tambah Barang
            </button>
          ) : null}
        </div>
      ) : (
        <>
          {/* Tabel untuk layar besar */}
          <div className="card hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse">
                <thead className="bg-cream/70">
                  <tr>
                    <th className="th">Kode</th>
                    <th className="th">Nama Barang</th>
                    <th className="th">Kategori</th>
                    <th className="th">Satuan</th>
                    <th className="th text-right">Harga Beli</th>
                    <th className="th text-right">Harga Jual</th>
                    <th className="th text-right">Stok</th>
                    <th className="th text-right">Min.</th>
                    <th className="th">Status</th>
                    {isAdmin ? <th className="th text-right">Aksi</th> : null}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-cream/40">
                      <td className="td font-mono text-xs text-muted">{product.product_code}</td>
                      <td className="td font-semibold">{product.name}</td>
                      <td className="td text-muted">{product.category}</td>
                      <td className="td text-muted">{product.unit}</td>
                      <td className="td text-right tabular-nums text-muted">
                        {formatRupiah(product.purchase_price)}
                      </td>
                      <td className="td text-right tabular-nums">
                        {formatRupiah(product.selling_price)}
                      </td>
                      <td className="td text-right font-semibold tabular-nums">
                        {formatNumber(product.stock)}
                      </td>
                      <td className="td text-right tabular-nums text-muted">
                        {formatNumber(product.minimum_stock)}
                      </td>
                      <td className="td">
                        <StatusBadge stock={product.stock} minimum={product.minimum_stock} />
                      </td>
                      {isAdmin ? (
                        <td className="td">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(product)}
                              className="btn-ghost btn-sm"
                              aria-label={`Ubah ${product.name}`}
                            >
                              <Icon name="edit" size={15} /> Ubah
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleting(product)}
                              className="btn-ghost btn-sm text-danger hover:bg-danger-bg hover:text-danger"
                              aria-label={`Hapus ${product.name}`}
                            >
                              <Icon name="trash" size={15} /> Hapus
                            </button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Kartu untuk HP */}
          <div className="space-y-2.5 md:hidden">
            {products.map((product) => (
              <div key={product.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{product.name}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-muted">
                      {product.product_code} · {product.category}
                    </p>
                  </div>
                  <StatusBadge stock={product.stock} minimum={product.minimum_stock} />
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-cream px-3 py-2 text-xs">
                  <div>
                    <dt className="text-muted">Stok</dt>
                    <dd className="font-semibold">
                      {formatNumber(product.stock)} {product.unit}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">Min.</dt>
                    <dd className="font-semibold">{formatNumber(product.minimum_stock)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Harga jual</dt>
                    <dd className="font-semibold">{formatRupiah(product.selling_price)}</dd>
                  </div>
                </dl>
                {isAdmin ? (
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => openEdit(product)} className="btn-secondary btn-sm flex-1">
                      <Icon name="edit" size={14} /> Ubah
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(product)}
                      className="btn-secondary btn-sm flex-1 text-danger"
                    >
                      <Icon name="trash" size={14} /> Hapus
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </>
      )}

      {!isAdmin ? (
        <p className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-xs text-muted">
          <RoleBadge role={role} />
          Penjaga toko hanya dapat melihat daftar barang. Perubahan data utama barang dilakukan admin.
        </p>
      ) : null}

      {modalOpen ? (
        <ProductModal
          key={editing?.id ?? "baru"}
          product={editing}
          categories={categories}
          defaultMinimumStock={defaultMinimumStock}
          onClose={() => setModalOpen(false)}
        />
      ) : null}

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Hapus barang?"
        description="Tindakan ini tidak dapat dibatalkan."
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setDeleting(null)}>
              Batal
            </button>
            <button type="button" className="btn-danger" onClick={handleDelete} disabled={deletePending}>
              {deletePending ? "Menghapus…" : "Ya, hapus barang"}
            </button>
          </>
        }
      >
        <p className="text-sm text-muted">
          Barang <span className="font-semibold text-ink">{deleting?.name}</span> akan dihapus dari
          daftar barang. Riwayat transaksi barang ini tetap tersimpan untuk keperluan audit.
        </p>
      </Modal>
    </div>
  );
}

function ProductModal({
  product,
  categories,
  defaultMinimumStock,
  onClose,
}: {
  product: Product | null;
  categories: string[];
  defaultMinimumStock: number;
  onClose: () => void;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    saveProductAction,
    null,
  );
  useActionToast(state, () => {
    onClose();
    router.refresh();
  });

  const isEdit = Boolean(product);

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? "Ubah barang" : "Tambah barang"}
      description={
        isEdit ? "Perbarui informasi barang. Stok diubah melalui menu Catat Stok." : "Lengkapi data barang baru."
      }
      size="lg"
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button type="submit" form="product-form" className="btn-primary" disabled={pending}>
            {pending ? "Menyimpan…" : isEdit ? "Simpan perubahan" : "Simpan barang"}
          </button>
        </>
      }
    >
      <form id="product-form" action={formAction} className="space-y-3.5">
        {product ? <input type="hidden" name="id" value={product.id} /> : null}
        {state && !state.ok ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-danger-line bg-danger-bg px-3.5 py-2.5 text-sm text-danger"
          >
            <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
            {state.error}
          </div>
        ) : null}

        <div className="grid gap-3.5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="product_code">
              Kode barang <span className="text-danger">*</span>
            </label>
            <input
              id="product_code"
              name="product_code"
              defaultValue={product?.product_code ?? ""}
              required
              maxLength={30}
              placeholder="cth. BRG011"
              className="input font-mono"
            />
            <p className="hint">Harus unik. Huruf, angka, titik, garis bawah, atau strip.</p>
          </div>
          <div>
            <label className="label" htmlFor="name">
              Nama barang <span className="text-danger">*</span>
            </label>
            <input
              id="name"
              name="name"
              defaultValue={product?.name ?? ""}
              required
              maxLength={120}
              placeholder="cth. Beras Pandan Wangi 5kg"
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="category">
              Kategori
            </label>
            <input
              id="category"
              name="category"
              defaultValue={product?.category ?? ""}
              list="category-options"
              maxLength={60}
              placeholder="cth. Sembako"
              className="input"
            />
            <datalist id="category-options">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="label" htmlFor="unit">
              Satuan
            </label>
            <select id="unit" name="unit" defaultValue={product?.unit ?? "pcs"} className="input">
              {UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="purchase_price">
              Harga beli (Rp)
            </label>
            <input
              id="purchase_price"
              name="purchase_price"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              defaultValue={product?.purchase_price ?? 0}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="selling_price">
              Harga jual (Rp)
            </label>
            <input
              id="selling_price"
              name="selling_price"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              defaultValue={product?.selling_price ?? 0}
              className="input"
            />
          </div>

          {isEdit ? (
            <div className="rounded-xl bg-cream px-3.5 py-2.5 text-xs text-muted sm:col-span-2">
              Stok saat ini <span className="font-bold text-ink">{formatNumber(product?.stock ?? 0)}</span>{" "}
              {product?.unit}. Untuk mengubah stok gunakan menu{" "}
              <span className="font-semibold text-ink">Catat Stok</span> agar tercatat di riwayat.
            </div>
          ) : (
            <div>
              <label className="label" htmlFor="stock">
                Jumlah stok awal
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                defaultValue={0}
                className="input"
              />
            </div>
          )}

          <div className={isEdit ? "sm:col-span-2" : ""}>
            <label className="label" htmlFor="minimum_stock">
              Batas minimum stok
            </label>
            <input
              id="minimum_stock"
              name="minimum_stock"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              defaultValue={product?.minimum_stock ?? defaultMinimumStock}
              className="input"
            />
            <p className="hint">Barang berstatus menipis bila stok ≤ batas minimum.</p>
          </div>
        </div>
      </form>
    </Modal>
  );
}
