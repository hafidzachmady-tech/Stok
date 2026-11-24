import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { ProductsView } from "@/components/products/ProductsView";
import { requireUser } from "@/lib/auth";
import { getCategories, getProducts } from "@/lib/data";
import { getSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Daftar Barang" };

const SORTS = ["nama", "kode", "stok", "harga"];

export default async function BarangPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kategori?: string; status?: string; sort?: string; dir?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;

  const filters = {
    q: params.q ?? "",
    kategori: params.kategori ?? "",
    status: params.status ?? "",
    sort: SORTS.includes(params.sort ?? "") ? (params.sort as string) : "nama",
    dir: params.dir === "desc" ? "desc" : "asc",
  };

  const [products, categories, settings, all] = await Promise.all([
    getProducts(filters),
    getCategories(),
    getSettings(),
    getProducts({}),
  ]);

  return (
    <div>
      <PageHeader
        title="Daftar Barang"
        description="Kelola seluruh barang toko, pantau stok, dan atur batas minimum."
      />
      <ProductsView
        products={products}
        categories={categories}
        role={user.role}
        filters={filters}
        totalAll={all.length}
        defaultMinimumStock={Number(settings.default_minimum_stock) || 5}
      />
    </div>
  );
}
