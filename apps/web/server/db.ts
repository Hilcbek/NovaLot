import { createDb, type Database } from "@novalot/shared/db";
import "server-only";

const globalForDb = globalThis as unknown as { db?: Database };

function initDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Missing DATABASE_URL in apps/web");

  const { db } = createDb(url, {
    max: 1,
    prepare: false,
    idle_timeout: 20,
  });
  return db;
}

export const db = globalForDb.db ?? initDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}
