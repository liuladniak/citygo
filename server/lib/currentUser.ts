import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/drizzle/schema.js";
import { unauthorized } from "./errors.js";

/** Turns the Supabase id from the sign-in token into our own users.id. */
export async function requireInternalUserId(supabaseId: string | undefined): Promise<number> {
  if (!supabaseId) throw unauthorized("User not found");
  const [row] = await db.select({ id: users.id }).from(users).where(eq(users.supabaseId, supabaseId)).limit(1);
  if (!row) throw unauthorized("User not found");
  return row.id;
}
