import { sql } from "drizzle-orm";
import { db } from "../db/index.js";

/** Empties every table in `public` and restarts id counters. Call in beforeEach. */
export async function resetDb() {
  const { rows } = await db.execute<{ tablename: string }>(
    sql`select tablename from pg_tables where schemaname = 'public'`,
  );
  if (!rows.length) return;
  const names = rows.map((r) => `"public"."${r.tablename}"`).join(", ");
  await db.execute(sql.raw(`truncate table ${names} restart identity cascade`));
}

export { db };
