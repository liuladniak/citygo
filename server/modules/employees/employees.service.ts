import { and, asc, count, desc, eq, gte, inArray, lt, or, sql } from "drizzle-orm";
import { companyTimezone } from "../../lib/companyTimezone.js";
import { db } from "../../db/index.js";
import { bookingAssignments, bookings, employees, tours } from "../../db/drizzle/schema.js";
import { nowInZone } from "../../lib/clock.js";
import { forbidden, notFound } from "../../lib/errors.js";
import { isoTimestamps, snakeColumns } from "../../lib/rows.js";
import { describeAvailability } from "./availability.js";
import { FIELD_POSITIONS, SELF_FIELDS, type CreateBody, type UpdateBody } from "./employees.schemas.js";

export type Viewer = { role: string | null; email: string | null };

const MAX_BOOKINGS_PER_DAY = 3;
const isManager = (viewer: Viewer) => viewer.role === "admin" || viewer.role === "manager";

const fullRow = snakeColumns(employees);

/** What every signed-in colleague may see: enough to pick someone for a task or tour. */
const directoryRow = {
  id: employees.id,
  first_name: employees.firstName,
  last_name: employees.lastName,
  position: employees.position,
  status: employees.status,
  profile_image: employees.profileImage,
};

const sameEmail = (a: string | null | undefined, b: string | null | undefined) =>
  !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();

const isSelf = (row: { email: string | null; work_email: string | null }, viewer: Viewer) =>
  sameEmail(row.email, viewer.email) || sameEmail(row.work_email, viewer.email);

const withIso = (row: Record<string, unknown>) => isoTimestamps(employees, row);

/** Everyone sees the short directory; managers get the whole record. */
export async function listEmployees(viewer: Viewer) {
  const rows = isManager(viewer)
    ? (await db.select(fullRow).from(employees).orderBy(asc(employees.id))).map(withIso)
    : await db.select(directoryRow).from(employees).orderBy(asc(employees.id));
  return { data: rows };
}

/** Field staff for one day, with how many tours each already has (three is a full day). */
export async function listAvailableOn(date: string) {
  const [staff, workload] = await Promise.all([
    db
      .select({ ...directoryRow })
      .from(employees)
      .where(inArray(employees.position, [...FIELD_POSITIONS])),
    db
      .select({ guideId: bookingAssignments.guideId, total: count() })
      .from(bookingAssignments)
      .innerJoin(bookings, eq(bookingAssignments.bookingId, bookings.id))
      .where(and(eq(bookings.tourDate, date), eq(bookingAssignments.status, "active")))
      .groupBy(bookingAssignments.guideId),
  ]);
  const byGuide = new Map(workload.map((w) => [w.guideId, w.total]));

  return {
    data: staff.map((e) => {
      const booked = byGuide.get(e.id) ?? 0;
      return { ...e, full_name: `${e.first_name} ${e.last_name}`, booking_count: booked, is_available: booked < MAX_BOOKINGS_PER_DAY };
    }),
  };
}

/** Looks someone up by personal or work email. Your own record, or any for managers. */
export async function findByEmail(email: string, viewer: Viewer) {
  const [row] = await db
    .select(fullRow)
    .from(employees)
    .where(or(sql`lower(${employees.email}) = lower(${email})`, sql`lower(${employees.workEmail}) = lower(${email})`))
    .limit(1);
  if (!row) throw notFound("Employee not found");
  if (!isManager(viewer) && !isSelf(row as never, viewer)) throw forbidden("Insufficient permissions");
  return withIso(row);
}

/** Today's team status for the Team page. */
export async function getTeamAvailability(at: Date = new Date()) {
  const { date, time } = nowInZone(await companyTimezone(), at);

  const [staff, assignments] = await Promise.all([
    db
      .select({
        id: employees.id,
        first_name: employees.firstName,
        last_name: employees.lastName,
        position: employees.position,
        profile_image: employees.profileImage,
        status: employees.status,
        shift_start: employees.shiftStart,
        shift_end: employees.shiftEnd,
        availability_override: employees.availabilityOverride,
        override_until: employees.overrideUntil,
      })
      .from(employees)
      .where(eq(employees.status, "active"))
      .orderBy(asc(employees.firstName), asc(employees.id)),
    db
      .select({
        guide_id: bookingAssignments.guideId,
        booking_id: bookings.id,
        start_time: bookings.startTime,
        end_time: bookings.endTime,
      })
      .from(bookingAssignments)
      .innerJoin(bookings, eq(bookingAssignments.bookingId, bookings.id))
      .where(and(eq(bookings.tourDate, date), eq(bookingAssignments.status, "active"), inArray(bookings.status, ["confirmed", "pending"]))),
  ]);

  return staff.map((s) =>
    describeAvailability({ ...s, override_until: s.override_until === null ? null : isoTimestamps(employees, { override_until: s.override_until }).override_until as string }, assignments, { time, at }),
  );
}

const assignmentRow = {
  booking_id: bookings.id,
  booking_reference: bookings.bookingReference,
  tour_date: bookings.tourDate,
  start_time: bookings.startTime,
  end_time: bookings.endTime,
  status: bookings.status,
  primary_contact_name: bookings.primaryContactName,
  tour_name: tours.tourName,
  role: bookingAssignments.role,
};

/** One employee with their next and last tours and counts. Full record for managers and the person themselves. */
export async function getEmployee(id: number, viewer: Viewer, at: Date = new Date()) {
  const [employee] = await db.select(fullRow).from(employees).where(eq(employees.id, id)).limit(1);
  if (!employee) throw notFound("Employee not found");

  const seeFull = isManager(viewer) || isSelf(employee as never, viewer);
  if (!seeFull) {
    const { id: eid, first_name, last_name, position, status, profile_image } = employee as Record<string, unknown>;
    return { id: eid, first_name, last_name, position, status, profile_image };
  }

  const { date: today } = nowInZone(await companyTimezone(), at);
  const mine = eq(bookingAssignments.guideId, id);
  const joined = () =>
    db
      .select(assignmentRow)
      .from(bookingAssignments)
      .innerJoin(bookings, eq(bookingAssignments.bookingId, bookings.id))
      .leftJoin(tours, eq(bookings.tourId, tours.id));

  const [upcoming, past, [stats]] = await Promise.all([
    joined()
      .where(and(mine, gte(bookings.tourDate, today), inArray(bookings.status, ["confirmed", "pending"])))
      .orderBy(asc(bookings.tourDate), asc(bookings.id))
      .limit(10),
    joined()
      .where(and(mine, lt(bookings.tourDate, today), inArray(bookings.status, ["confirmed", "completed"])))
      .orderBy(desc(bookings.tourDate), desc(bookings.id))
      .limit(20),
    db
      .select({
        total: count(),
        thisMonth: sql<number>`count(*) filter (where date_trunc('month', ${bookings.tourDate}) = date_trunc('month', ${today}::date))`.mapWith(Number),
      })
      .from(bookingAssignments)
      .innerJoin(bookings, eq(bookingAssignments.bookingId, bookings.id))
      .where(and(mine, inArray(bookings.status, ["confirmed", "completed"]))),
  ]);

  return {
    ...withIso(employee),
    upcoming_assignments: upcoming,
    past_assignments: past,
    stats: { total_tours: stats.total, tours_this_month: stats.thisMonth },
  };
}

// API names to column properties, so a body key is only ever written to its own column.
const columnFor: Record<string, keyof typeof employees.$inferInsert> = {
  first_name: "firstName", last_name: "lastName", position: "position", status: "status", email: "email",
  phone: "phone", work_email: "workEmail", notes: "notes", shift_start: "shiftStart", shift_end: "shiftEnd",
  employment_type: "employmentType", contract_start: "contractStart", languages: "languages", licences: "licences",
  skills: "skills", education: "education", emergency_contact_name: "emergencyContactName",
  emergency_contact_phone: "emergencyContactPhone", emergency_contact_relation: "emergencyContactRelation",
  availability_override: "availabilityOverride", override_until: "overrideUntil", profile_image: "profileImage",
  notif_new_booking: "notifNewBooking", notif_cancellation: "notifCancellation",
  notif_daily_schedule: "notifDailySchedule", notif_unassigned_tours: "notifUnassignedTours",
};

const toColumns = (body: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(body).filter(([k, v]) => v !== undefined && k in columnFor).map(([k, v]) => [columnFor[k], v]));

export async function createEmployee(body: CreateBody) {
  const [row] = await db
    .insert(employees)
    .values({ status: "active", ...toColumns(body) } as typeof employees.$inferInsert)
    .returning(fullRow);
  return withIso(row);
}

/** Managers may change anything. Everyone else may change only their own basic details and notification choices. */
export async function updateEmployee(id: number, body: UpdateBody, viewer: Viewer) {
  let changes: Record<string, unknown> = body;

  if (!isManager(viewer)) {
    const [target] = await db.select({ email: employees.email, work_email: employees.workEmail }).from(employees).where(eq(employees.id, id)).limit(1);
    if (!target) throw notFound("Employee not found");
    if (!isSelf(target, viewer)) throw forbidden("Insufficient permissions");
    // The settings page sends the position along; it is simply not theirs to change.
    changes = Object.fromEntries(Object.entries(body).filter(([k]) => (SELF_FIELDS as readonly string[]).includes(k)));
  }

  const columns = toColumns(changes);
  if (Object.keys(columns).length === 0) throw forbidden("No fields you may update");

  const [row] = await db
    .update(employees)
    .set({ ...columns, updatedAt: sql`CURRENT_TIMESTAMP` })
    .where(eq(employees.id, id))
    .returning(fullRow);
  if (!row) throw notFound("Employee not found");
  return withIso(row);
}

export async function deactivateEmployee(id: number, reason: string, at: Date = new Date()) {
  const { date } = nowInZone(await companyTimezone(), at);
  const note = `Deactivated: ${reason} (${date})`;
  const [row] = await db
    .update(employees)
    .set({
      status: "inactive",
      notes: sql`coalesce(${employees.notes} || E'\n', '') || ${note}`,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(eq(employees.id, id))
    .returning(fullRow);
  if (!row) throw notFound("Employee not found");
  return withIso(row);
}
