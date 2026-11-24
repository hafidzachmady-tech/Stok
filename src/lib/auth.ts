import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb, type Database } from "./db";
import { newId, randomToken, sha256, verifyPassword } from "./password";
import type { SessionUser } from "./types";

export const SESSION_COOKIE = "tk_session";
const SESSION_DAYS = 7;
const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

type SessionRow = {
  id: string;
  full_name: string;
  username: string;
  role: "admin" | "penjaga";
  is_active: number;
  expires_at: string | number;
};

/**
 * Membaca sesi dari cookie httpOnly, memvalidasi token (disimpan sebagai
 * hash SHA-256) ke database, lalu memastikan akun masih aktif.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const sql = await getDb();
  const tokenHash = await sha256(token);
  const rows = await sql<SessionRow[]>`
    select p.id, p.full_name, p.username, p.role, p.is_active, s.expires_at
    from sessions s
    join profiles p on p.id = s.user_id
    where s.id = ${tokenHash}
  `;
  const row = rows[0];
  if (!row) return null;

  if (Number(row.expires_at) < Date.now()) {
    await sql`delete from sessions where id = ${tokenHash}`;
    return null;
  }
  if (!row.is_active) return null;

  return {
    id: row.id,
    full_name: row.full_name,
    username: row.username,
    role: row.role,
    is_active: row.is_active,
  };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/beranda?akses=ditolak");
  return user;
}

export async function createSession(userId: string): Promise<string> {
  const sql = await getDb();
  const token = randomToken(32);
  const tokenHash = await sha256(token);
  const now = Date.now();
  await sql`
    insert into sessions (id, user_id, created_at, expires_at)
    values (${tokenHash}, ${userId}, now(), ${now + SESSION_MS})
  `;
  await sql`delete from sessions where expires_at < ${now}`;
  return token;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    const sql = await getDb();
    const tokenHash = await sha256(token);
    await sql`delete from sessions where id = ${tokenHash}`;
  }
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_DAYS * 24 * 60 * 60,
};

export async function registerFailedAttempt(
  sql: Database,
  userId: string,
  attempts: number,
): Promise<void> {
  const nextAttempts = attempts + 1;
  const lockedUntil = nextAttempts >= MAX_FAILED_ATTEMPTS ? Date.now() + LOCK_MS : null;
  await sql`
    update profiles set failed_attempts = ${nextAttempts}, locked_until = ${lockedUntil} where id = ${userId}
  `;
}

export async function resetFailedAttempts(sql: Database, userId: string): Promise<void> {
  await sql`update profiles set failed_attempts = 0, locked_until = null where id = ${userId}`;
}

export async function auditLog(
  sql: Database,
  userId: string | null,
  userName: string,
  action: string,
  description: string,
): Promise<void> {
  await sql`
    insert into audit_logs (id, user_id, user_name, action, description, created_at)
    values (${newId()}, ${userId}, ${userName}, ${action}, ${description}, now())
  `;
}

type CredentialRow = {
  id: string;
  full_name: string;
  username: string;
  role: "admin" | "penjaga";
  is_active: number;
  password_hash: string;
  failed_attempts: number;
  locked_until: string | number | null;
};

export type CredentialCheck =
  | { ok: true; user: SessionUser }
  | { ok: false; error: string };

/** Verifikasi kredensial login, termasuk pembatasan percobaan berulang. */
export async function checkCredentials(
  username: string,
  password: string,
): Promise<CredentialCheck> {
  const sql = await getDb();
  const genericError = "Username atau password salah.";
  const normalized = username.trim().toLowerCase();

  const rows = await sql<CredentialRow[]>`
    select id, full_name, username, role, is_active, password_hash, failed_attempts, locked_until
    from profiles
    where username = ${normalized}
  `;
  const user = rows[0];

  if (!user) {
    // Tetap lakukan hashing agar waktu respons tidak membocorkan keberadaan akun.
    await verifyPassword(password, "pbkdf2$60000$00000000000000000000000000000000$" + "0".repeat(64));
    return { ok: false, error: genericError };
  }

  const lockedUntil = user.locked_until === null ? 0 : Number(user.locked_until);
  if (lockedUntil > Date.now()) {
    const minutes = Math.max(1, Math.ceil((lockedUntil - Date.now()) / 60000));
    return { ok: false, error: `Terlalu banyak percobaan gagal. Coba lagi dalam ${minutes} menit.` };
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    await registerFailedAttempt(sql, user.id, Number(user.failed_attempts) || 0);
    return { ok: false, error: genericError };
  }

  if (!user.is_active) {
    return { ok: false, error: "Akun ini sedang nonaktif. Hubungi admin toko." };
  }

  await resetFailedAttempts(sql, user.id);
  return {
    ok: true,
    user: {
      id: user.id,
      full_name: user.full_name,
      username: user.username,
      role: user.role,
      is_active: user.is_active,
    },
  };
}
