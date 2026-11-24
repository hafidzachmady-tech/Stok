"use server";

import { revalidatePath } from "next/cache";
import { auditLog, requireAdmin } from "../auth";
import { getDb } from "../db";
import { hashPassword, newId } from "../password";
import type { ActionResult } from "../types";
import { isRole, rawStr, str } from "../validate";

function usernameError(username: string): string | null {
  if (!username) return "Username wajib diisi.";
  if (username.length < 3) return "Username minimal 3 karakter.";
  if (username.length > 40) return "Username maksimal 40 karakter.";
  if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
    return "Username hanya boleh berisi huruf, angka, titik, garis bawah, atau strip.";
  }
  return null;
}

function passwordError(password: string): string | null {
  if (password.length < 6) return "Password minimal 6 karakter.";
  if (password.length > 128) return "Password maksimal 128 karakter.";
  return null;
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

type TargetRow = {
  id: string;
  full_name: string;
  username: string;
  role: "admin" | "penjaga";
  is_active: number;
};

export async function createUserAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const fullName = str(formData, "full_name");
  const username = str(formData, "username").toLowerCase();
  const password = rawStr(formData, "password");
  const role = str(formData, "role") || "penjaga";

  if (!fullName) return { ok: false, error: "Nama lengkap wajib diisi." };
  if (fullName.length > 80) return { ok: false, error: "Nama lengkap maksimal 80 karakter." };
  const uErr = usernameError(username);
  if (uErr) return { ok: false, error: uErr };
  const pErr = passwordError(password);
  if (pErr) return { ok: false, error: pErr };
  if (!isRole(role)) return { ok: false, error: "Peran pengguna tidak valid." };

  const sql = await getDb();
  const existing = await sql<{ id: string }[]>`select id from profiles where username = ${username}`;
  if (existing[0]) return { ok: false, error: `Username "${username}" sudah digunakan.` };

  try {
    const passwordHash = await hashPassword(password);
    await sql.begin(async (tx) => {
      await tx`
        insert into profiles (id, full_name, username, password_hash, role, is_active, created_at)
        values (${newId()}, ${fullName}, ${username}, ${passwordHash}, ${role}, 1, now())
      `;
      await tx`
        insert into audit_logs (id, user_id, user_name, action, description, created_at)
        values (${newId()}, ${admin.id}, ${admin.full_name}, 'create_user',
          ${`Menambahkan akun ${role} dengan username ${username}`}, now())
      `;
    });
    revalidatePath("/pengguna");
    revalidatePath("/pengaturan");
    return { ok: true, message: `Akun "${username}" berhasil dibuat.` };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, error: `Username "${username}" sudah digunakan.` };
    }
    console.error("createUserAction", error);
    return { ok: false, error: "Gagal membuat akun. Coba lagi." };
  }
}

export async function updateUserAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = str(formData, "id");
  const fullName = str(formData, "full_name");
  const role = str(formData, "role");
  const isActive = str(formData, "is_active") === "1" ? 1 : 0;

  if (!id) return { ok: false, error: "Pengguna tidak ditemukan." };
  if (!fullName) return { ok: false, error: "Nama lengkap wajib diisi." };
  if (fullName.length > 80) return { ok: false, error: "Nama lengkap maksimal 80 karakter." };
  if (!isRole(role)) return { ok: false, error: "Peran pengguna tidak valid." };

  const sql = await getDb();
  const rows = await sql<TargetRow[]>`
    select id, full_name, username, role, is_active from profiles where id = ${id}
  `;
  const target = rows[0];
  if (!target) return { ok: false, error: "Pengguna tidak ditemukan." };

  if (target.id === admin.id) {
    if (role !== "admin") return { ok: false, error: "Anda tidak dapat mengubah peran akun sendiri." };
    if (!isActive) return { ok: false, error: "Anda tidak dapat menonaktifkan akun sendiri." };
  }

  if (target.role === "admin" && (role !== "admin" || !isActive)) {
    const activeAdmins = await sql<{ n: number }[]>`
      select count(*)::int as n from profiles where role = 'admin' and is_active = 1
    `;
    if ((activeAdmins[0]?.n ?? 0) <= 1) {
      return { ok: false, error: "Minimal harus ada satu admin aktif. Tambahkan admin lain terlebih dahulu." };
    }
  }

  try {
    await sql.begin(async (tx) => {
      await tx`update profiles set full_name = ${fullName}, role = ${role}, is_active = ${isActive} where id = ${id}`;
      if (!isActive) {
        await tx`delete from sessions where user_id = ${id}`;
      }
      await tx`
        insert into audit_logs (id, user_id, user_name, action, description, created_at)
        values (${newId()}, ${admin.id}, ${admin.full_name}, 'update_user',
          ${`Mengubah akun ${target.username}: nama "${fullName}", peran ${role}, status ${isActive ? "aktif" : "nonaktif"}`},
          now())
      `;
    });
    revalidatePath("/pengguna");
    revalidatePath("/pengaturan");
    return { ok: true, message: `Akun "${target.username}" berhasil diperbarui.` };
  } catch (error) {
    console.error("updateUserAction", error);
    return { ok: false, error: "Gagal memperbarui akun. Coba lagi." };
  }
}

export async function toggleUserActiveAction(id: string, nextActive: boolean): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!id) return { ok: false, error: "Pengguna tidak ditemukan." };
  if (id === admin.id) return { ok: false, error: "Anda tidak dapat menonaktifkan akun sendiri." };

  const sql = await getDb();
  const rows = await sql<{ id: string; username: string; role: string; is_active: number }[]>`
    select id, username, role, is_active from profiles where id = ${id}
  `;
  const target = rows[0];
  if (!target) return { ok: false, error: "Pengguna tidak ditemukan." };

  if (!nextActive && target.role === "admin") {
    const activeAdmins = await sql<{ n: number }[]>`
      select count(*)::int as n from profiles where role = 'admin' and is_active = 1
    `;
    if ((activeAdmins[0]?.n ?? 0) <= 1) {
      return { ok: false, error: "Minimal harus ada satu admin aktif." };
    }
  }

  try {
    await sql.begin(async (tx) => {
      await tx`update profiles set is_active = ${nextActive ? 1 : 0} where id = ${id}`;
      if (!nextActive) {
        await tx`delete from sessions where user_id = ${id}`;
      }
      await tx`
        insert into audit_logs (id, user_id, user_name, action, description, created_at)
        values (${newId()}, ${admin.id}, ${admin.full_name}, 'update_user_status',
          ${`${nextActive ? "Mengaktifkan" : "Menonaktifkan"} akun ${target.username}`}, now())
      `;
    });
    revalidatePath("/pengguna");
    return {
      ok: true,
      message: `Akun "${target.username}" ${nextActive ? "diaktifkan" : "dinonaktifkan"}.`,
    };
  } catch (error) {
    console.error("toggleUserActiveAction", error);
    return { ok: false, error: "Gagal mengubah status akun. Coba lagi." };
  }
}

export async function resetPasswordAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = str(formData, "id");
  const password = rawStr(formData, "password");
  const confirm = rawStr(formData, "password_confirm");

  if (!id) return { ok: false, error: "Pengguna tidak ditemukan." };
  const pErr = passwordError(password);
  if (pErr) return { ok: false, error: pErr };
  if (password !== confirm) return { ok: false, error: "Konfirmasi password tidak sama." };

  const sql = await getDb();
  const rows = await sql<{ id: string; username: string }[]>`
    select id, username from profiles where id = ${id}
  `;
  const target = rows[0];
  if (!target) return { ok: false, error: "Pengguna tidak ditemukan." };

  try {
    const passwordHash = await hashPassword(password);
    await sql.begin(async (tx) => {
      await tx`
        update profiles set password_hash = ${passwordHash}, failed_attempts = 0, locked_until = null
        where id = ${id}
      `;
      // Semua sesi lama dicabut setelah password diatur ulang.
      await tx`delete from sessions where user_id = ${id}`;
      await tx`
        insert into audit_logs (id, user_id, user_name, action, description, created_at)
        values (${newId()}, ${admin.id}, ${admin.full_name}, 'reset_password',
          ${`Mengatur ulang password akun ${target.username}`}, now())
      `;
    });
    revalidatePath("/pengguna");
    revalidatePath("/pengaturan");
    return {
      ok: true,
      message: `Password "${target.username}" berhasil diatur ulang. Sampaikan password baru secara aman.`,
    };
  } catch (error) {
    console.error("resetPasswordAction", error);
    return { ok: false, error: "Gagal mengatur ulang password. Coba lagi." };
  }
}
