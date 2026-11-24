"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  auditLog,
  checkCredentials,
  createSession,
  destroySession,
  getSessionUser,
  sessionCookieOptions,
} from "../auth";
import { getDb } from "../db";
import type { ActionResult } from "../types";
import { rawStr } from "../validate";

export async function loginAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const username = rawStr(formData, "username").trim();
  const password = rawStr(formData, "password");

  if (!username || !password) {
    return { ok: false, error: "Username dan password wajib diisi." };
  }
  if (username.length > 100 || password.length > 200) {
    return { ok: false, error: "Username atau password terlalu panjang." };
  }

  let result;
  try {
    result = await checkCredentials(username, password);
  } catch (error) {
    console.error("loginAction", error);
    return {
      ok: false,
      error: "Gagal menghubungi server atau database. Periksa koneksi lalu coba lagi.",
    };
  }

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  const token = await createSession(result.user.id);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions);

  const sql = await getDb();
  await auditLog(
    sql,
    result.user.id,
    result.user.full_name,
    "login",
    `${result.user.full_name} masuk ke aplikasi`,
  );

  redirect("/beranda");
}

export async function logoutAction(): Promise<void> {
  const user = await getSessionUser();
  if (user) {
    const sql = await getDb();
    await auditLog(sql, user.id, user.full_name, "logout", `${user.full_name} keluar dari aplikasi`);
  }
  await destroySession();
  redirect("/login");
}
