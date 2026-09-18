import { drizzle } from "drizzle-orm/postgres-js";
import postgres, { type Options } from "postgres";
import * as schema from "./schema";

export function createDb(url: string, options?: Options<{}>) {
  const client = postgres(url, options);
  const db = drizzle(client, { schema });
  return { db, client };
}

export type Database = ReturnType<typeof createDb>["db"];
export * as schema from "./schema";