import { getTableColumns, type Table } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { toIsoTimestamp } from "./dates.js";

/**
 * Select every column of a table under its database name (snake_case), which is how the
 * API has always spoken. Use as `db.select(snakeColumns(employees)).from(employees)`.
 */
export function snakeColumns<T extends Table>(table: T) {
  const columns = getTableColumns(table) as Record<string, PgColumn>;
  return Object.fromEntries(Object.values(columns).map((c) => [c.name, c])) as Record<string, PgColumn>;
}

/** Timestamps leave the API as ISO strings, the way they always have. Dates stay YYYY-MM-DD. */
export function isoTimestamps<R extends Record<string, unknown>>(table: Table, row: R): R {
  const columns = getTableColumns(table) as Record<string, PgColumn>;
  const out: Record<string, unknown> = { ...row };
  for (const column of Object.values(columns)) {
    const value = out[column.name];
    if (column.columnType === "PgTimestampString" && typeof value === "string") {
      out[column.name] = toIsoTimestamp(value);
    }
  }
  return out as R;
}
