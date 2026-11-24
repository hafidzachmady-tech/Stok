export function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function rawStr(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

/** Mengembalikan bilangan bulat >= 0, atau null bila tidak valid. */
export function nonNegativeInt(formData: FormData, key: string): number | null {
  const raw = str(formData, key);
  if (raw === "") return 0;
  if (!/^\d+$/.test(raw)) return null;
  const value = Number(raw);
  return Number.isSafeInteger(value) ? value : null;
}

export function positiveInt(formData: FormData, key: string): number | null {
  const value = nonNegativeInt(formData, key);
  if (value === null || value <= 0) return null;
  return value;
}

export function isRole(value: string): value is "admin" | "penjaga" {
  return value === "admin" || value === "penjaga";
}

export function isStockStatusFilter(value: string): boolean {
  return value === "" || value === "semua" || value === "aman" || value === "menipis" || value === "habis";
}
