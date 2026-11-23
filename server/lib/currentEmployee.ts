import { or, sql } from "drizzle-orm";
import type { db } from "../db/index.js";
import { employees } from "../db/drizzle/schema.js";

/** The staff member behind a signed-in email (personal or work), if they have an employee record. */
export async function findEmployeeByEmail(executor: Pick<typeof db, "select">, email: string | null | undefined) {
  if (!email) return null;
  const [row] = await executor
    .select({ id: employees.id, firstName: employees.firstName, lastName: employees.lastName })
    .from(employees)
    .where(or(sql`lower(${employees.email}) = lower(${email})`, sql`lower(${employees.workEmail}) = lower(${email})`))
    .limit(1);
  return row ?? null;
}
