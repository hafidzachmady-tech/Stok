import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "./db";
import { newId, randomToken, sha256, verifyPassword } from "./password";
import type { SessionUser } from "./types";

export const SESSION_COOKIE = "tk_session";
const SESSION_DAYS = 7;
const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

/**
 * Membaca sesi dari cookie httpOnly, memvalidasi token (disimpan sebagai
 * hash SHA-256) ke database, lalu memastikan akun masih aktif.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = await getDb();
  const tokenHash = await sha256(token);
  const row = await db
    .prepare(
      `SELECT p.id, p.full_name, p.username, p.role, p.is_active, s.expires_at
       FROM sessions s JOIN profiles p ON p.id = s.user_id
       WHERE s.id = ?`,
    )
    .bind(tokenHash)
    .first<SessionUser & { expires_at: number }>();

  if (!row) return null;
  if (row.expires_at < Date.now()) {
    await db.prepare("DELETE FROM sessions WHERE id = ?").bind(tokenHash).run();
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
  const db = await getDb();
  const token = randomToken(32);
  const tokenHash = await sha256(token);
  const now = Date.now();
  await db
    .prepare("INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)")
    .bind(tokenHash, userId, new Date(now).toISOString(), now + SESSION_MS)
    .run();
  // Bersihkan sesi kedaluwarsa secara oportunistik.
  await db.prepare("DELETE FROM sessions WHERE expires_at < ?").bind(now).run();
  return token;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = await getDb();
    const tokenHash = await sha256(token);
    await db.prepare("DELETE FROM sessions WHERE id = ?").bind(tokenHash).run();
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
  db: Awaited<ReturnType<typeof getDb>>,
  userId: string,
  attempts: number,
): Promise<void> {
  const nextAttempts = attempts + 1;
  const lockedUntil = nextAttempts >= MAX_FAILED_ATTEMPTS ? Date.now() + LOCK_MS : null;
  await db
    .prepare("UPDATE profiles SET failed_attempts = ?, locked_until = ? WHERE id = ?")
    .bind(nextAttempts, lockedUntil, userId)
    .run();
}

export async function resetFailedAttempts(
  db: Awaited<ReturnType<typeof getDb>>,
  userId: string,
): Promise<void> {
  await db
    .prepare("UPDATE profiles SET failed_attempts = 0, locked_until = NULL WHERE id = ?")
    .bind(userId)
    .run();
}

export async function auditLog(
  db: Awaited<ReturnType<typeof getDb>>,
  userId: string | null,
  userName: string,
  action: string,
  description: string,
): Promise<void> {
  await db
    .prepare(
      "INSERT INTO audit_logs (id, user_id, user_name, action, description, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .bind(newId(), userId, userName, action, description, new Date().toISOString())
    .run();
}

export type CredentialCheck =
  | { ok: true; user: SessionUser & { password_hash: string; failed_attempts: number; locked_until: number | null } }
  | { ok: false; error: string; userId?: string; failedAttempts?: number };

/** Verifikasi kredensial login, termasuk pembatasan percobaan berulang. */
export async function checkCredentials(
  username: string,
  password: string,
): Promise<CredentialCheck> {
  const db = await getDb();
  const genericError = "Username atau password salah.";
  const user = await db
    .prepare(
      `SELECT id, full_name, username, role, is_active, password_hash, failed_attempts, locked_until
       FROM profiles WHERE username = ?`,
    )
    .bind(username)
    .first<SessionUser & { password_hash: string; failed_attempts: number; locked_until: number | null }>();

  if (!user) {
    // Tetap lakukan hashing agar waktu respons tidak membocorkan keberadaan akun.
    await verifyPassword(password, "pbkdf2$60000$00000000000000000000000000000000$" + "0".repeat(64));
    return { ok: false, error: genericError };
  }

  if (user.locked_until && user.locked_until > Date.now()) {
    const minutes = Math.max(1, Math.ceil((user.locked_until - Date.now()) / 60000));
    return {
      ok: false,
      error: `Terlalu banyak percobaan gagal. Coba lagi dalam ${minutes} menit.`,
    };
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    await registerFailedAttempt(db, user.id, user.failed_attempts);
    return { ok: false, error: genericError, userId: user.id, failedAttempts: user.failed_attempts + 1 };
  }

  if (!user.is_active) {
    return { ok: false, error: "Akun ini sedang nonaktif. Hubungi admin toko." };
  }

  await resetFailedAttempts(db, user.id);
  return { ok: true, user };
}
