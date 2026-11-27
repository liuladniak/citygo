import { db } from "../db/index.js";
import { companySettings } from "../db/drizzle/schema.js";
import { DEFAULT_TIMEZONE } from "./clock.js";

/** The timezone tours run in, from company settings. */
export async function companyTimezone(): Promise<string> {
  const [row] = await db.select({ timezone: companySettings.timezone }).from(companySettings).limit(1);
  return row?.timezone || DEFAULT_TIMEZONE;
}
