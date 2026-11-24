import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";

export interface AppEnv {
  DB: D1Database;
  DEMO_MODE?: string;
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD?: string;
  APP_ORIGIN?: string;
  [key: string]: unknown;
}

/** Mengambil environment Worker (binding DB + variabel konfigurasi). */
export async function getEnv(): Promise<AppEnv> {
  const { env } = await getCloudflareContext({ async: true });
  return env as unknown as AppEnv;
}
