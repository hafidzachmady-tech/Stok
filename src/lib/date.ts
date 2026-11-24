// Toko kelontong beroperasi pada zona waktu Asia/Jakarta (UTC+7).
// Data transaksi disimpan sebagai ISO UTC agar konsisten, sedangkan
// pengelompokan dan filter tanggal dilakukan pada hari lokal Jakarta.
export const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;

const DAY_MS = 24 * 60 * 60 * 1000;

function jakartaShifted(date: Date): Date {
  return new Date(date.getTime() + JAKARTA_OFFSET_MS);
}

/** Kunci tanggal Jakarta dalam format YYYY-MM-DD. */
export function jakartaDayKey(date: Date = new Date()): string {
  return jakartaShifted(date).toISOString().slice(0, 10);
}

/** Awal hari (00:00 Jakarta) untuk kunci tanggal tertentu, sebagai ISO UTC. */
export function jakartaDayStartIso(dayKey: string): string {
  return new Date(`${dayKey}T00:00:00+07:00`).toISOString();
}

export function addDaysToKey(dayKey: string, days: number): string {
  const d = new Date(`${dayKey}T00:00:00+07:00`);
  return jakartaDayKey(new Date(d.getTime() + days * DAY_MS));
}

export function daysAgoKey(days: number): string {
  return addDaysToKey(jakartaDayKey(), -days);
}

export function currentMonthStartKey(): string {
  return jakartaDayKey().slice(0, 8) + "01";
}

export function rangeKeys(startKey: string, endKey: string): string[] {
  const keys: string[] = [];
  let cursor = startKey;
  let guard = 0;
  while (cursor <= endKey && guard < 400) {
    keys.push(cursor);
    cursor = addDaysToKey(cursor, 1);
    guard += 1;
  }
  return keys;
}

/** Label singkat hari, contoh "24 Nov". */
export function shortDayLabel(dayKey: string): string {
  const d = new Date(`${dayKey}T12:00:00+07:00`);
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
  }).format(d);
}

/** Tanggal lengkap untuk tooltip, contoh "Senin, 24 November 2026". */
export function longDayLabel(dayKey: string): string {
  const d = new Date(`${dayKey}T12:00:00+07:00`);
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function isValidDayKey(value: string | undefined | null): boolean {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** ISO untuk sebuah hari Jakarta pada jam tertentu. */
export function isoAt(dayKey: string, hour: number, minute = 0): string {
  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  return new Date(`${dayKey}T${hh}:${mm}:00+07:00`).toISOString();
}
