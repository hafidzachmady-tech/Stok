// Server PostgreSQL lokal untuk pengembangan tanpa akun Supabase.
// PGlite menjalankan Postgres asli (WASM) dan mengekspos protokol wire
// sehingga aplikasi dapat terhubung lewat DATABASE_URL biasa.
//
// Jalankan: npm run db:local
// Lalu set DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/postgres
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const dataDir = process.env.PGLITE_DATA_DIR || ".pgdata";
const port = Number(process.env.PGLITE_PORT || 5432);

const db = await PGlite.create({ dataDir });
const server = new PGLiteSocketServer({ db, port, host: "127.0.0.1" });
await server.start();

console.log(`Postgres lokal aktif di 127.0.0.1:${port} (data: ${dataDir})`);
console.log(`DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:${port}/postgres`);

const shutdown = async () => {
  await server.stop();
  await db.close();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
