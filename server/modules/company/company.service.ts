import { asc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { agencyRecurringUnavailabilities, agencyUnavailableDates, companySettings } from "../../db/drizzle/schema.js";
import { toIsoTimestamp } from "../../lib/dates.js";
import { conflict, notFound } from "../../lib/errors.js";
import type { BlockedDateBody, BlockedWeekdayBody, SettingsBody } from "./company.schemas.js";

const SETTINGS_ID = 1;

const settingsColumns = {
  id: companySettings.id,
  name: companySettings.name,
  logo_url: companySettings.logoUrl,
  email: companySettings.email,
  phone: companySettings.phone,
  address: companySettings.address,
  city: companySettings.city,
  country: companySettings.country,
  website: companySettings.website,
  timezone: companySettings.timezone,
  currency: companySettings.currency,
  vat_number: companySettings.vatNumber,
  invoice_footer: companySettings.invoiceFooter,
  created_at: companySettings.createdAt,
  updated_at: companySettings.updatedAt,
  booking_window_months: companySettings.bookingWindowMonths,
};

const iso = (value: string | null) => (value === null ? null : toIsoTimestamp(value));

const settingsResponse = (row: { created_at: string | null; updated_at: string | null }) => ({
  ...row,
  created_at: iso(row.created_at),
  updated_at: iso(row.updated_at),
});

export async function getSettings() {
  const [row] = await db.select(settingsColumns).from(companySettings).orderBy(asc(companySettings.id)).limit(1);
  if (!row) throw notFound("Company settings not found");
  return settingsResponse(row);
}

export async function updateSettings(body: SettingsBody) {
  const { vat_number, invoice_footer, logo_url, ...rest } = body;
  const [row] = await db
    .update(companySettings)
    .set({
      ...rest,
      ...(vat_number !== undefined && { vatNumber: vat_number }),
      ...(invoice_footer !== undefined && { invoiceFooter: invoice_footer }),
      ...(logo_url !== undefined && { logoUrl: logo_url }),
      updatedAt: new Date().toISOString().replace("T", " ").replace("Z", ""),
    })
    .where(eq(companySettings.id, SETTINGS_ID))
    .returning(settingsColumns);
  if (!row) throw notFound("Company settings not found");
  return settingsResponse(row);
}

const dateRow = {
  id: agencyUnavailableDates.id,
  unavailable_date: agencyUnavailableDates.unavailableDate,
  reason: agencyUnavailableDates.reason,
  created_at: agencyUnavailableDates.createdAt,
};

const weekdayRow = {
  id: agencyRecurringUnavailabilities.id,
  day_of_week: agencyRecurringUnavailabilities.dayOfWeek,
  reason: agencyRecurringUnavailabilities.reason,
  created_at: agencyRecurringUnavailabilities.createdAt,
};

const withCreatedAt = <T extends { created_at: string | null }>(row: T) => ({ ...row, created_at: iso(row.created_at) });

/** Days the whole agency is closed: specific dates and weekdays that repeat. */
export async function getAvailability() {
  const [specific, recurring] = await Promise.all([
    db.select(dateRow).from(agencyUnavailableDates).orderBy(asc(agencyUnavailableDates.unavailableDate)),
    db.select(weekdayRow).from(agencyRecurringUnavailabilities).orderBy(asc(agencyRecurringUnavailabilities.dayOfWeek)),
  ]);
  return { specific: specific.map(withCreatedAt), recurring: recurring.map(withCreatedAt) };
}

export async function blockDate({ date, reason }: BlockedDateBody) {
  const [row] = await db
    .insert(agencyUnavailableDates)
    .values({ unavailableDate: date, reason: reason || null })
    .returning(dateRow);
  return withCreatedAt(row);
}

export async function unblockDate(id: number) {
  await db.delete(agencyUnavailableDates).where(eq(agencyUnavailableDates.id, id));
}

export async function blockWeekday({ day_of_week, reason }: BlockedWeekdayBody) {
  // The unique index on day_of_week settles two clicks at once; no check-then-insert race.
  const [row] = await db
    .insert(agencyRecurringUnavailabilities)
    .values({ dayOfWeek: day_of_week, reason: reason || null })
    .onConflictDoNothing()
    .returning(weekdayRow);
  if (!row) throw conflict("Already blocked");
  return withCreatedAt(row);
}

export async function unblockWeekday(id: number) {
  await db.delete(agencyRecurringUnavailabilities).where(eq(agencyRecurringUnavailabilities.id, id));
}
