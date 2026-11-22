import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { bookings, users } from "../../db/drizzle/schema.js";
import { conflict, notFound } from "../../lib/errors.js";
import { maskEmail, maskEmergencyContact, maskPhone } from "../../lib/maskContact.js";
import type { UpdateBody } from "./profile.schemas.js";

export type SignedInUser = {
  id: string;
  email?: string | null;
  user_metadata?: { first_name?: string; last_name?: string; full_name?: string };
};

type UserRow = typeof users.$inferSelect;

const present = (user: UserRow) => ({
  id: user.id,
  first_name: user.firstName,
  last_name: user.lastName,
  preferred_name: user.preferredName,
  notification_preference: user.notificationPreference,
  gift_credit: user.giftCredit,
  email: maskEmail(user.email),
  phone_number: maskPhone(user.phoneNumber),
  emergency_contact: maskEmergencyContact(user.emergencyContact),
});

const findBySupabaseId = async (supabaseId: string) =>
  (await db.select().from(users).where(eq(users.supabaseId, supabaseId)).limit(1))[0];

function namesFrom(user: SignedInUser) {
  const meta = user.user_metadata ?? {};
  const parts = meta.full_name?.split(" ") ?? [];
  return {
    firstName: meta.first_name || parts[0] || "",
    lastName: meta.last_name || parts.slice(1).join(" ") || "",
  };
}

/** The guest's profile. First sign-in creates it and attaches earlier bookings made with the same email. */
export async function getOrCreateProfile(signedIn: SignedInUser) {
  const existing = await findBySupabaseId(signedIn.id);
  if (existing) return present(existing);

  if (!signedIn.email) throw conflict("Your account has no email address");

  const created = await db.transaction(async (tx) => {
    // Two requests at once (a page and its prefetch) both end up with the same single row.
    await tx
      .insert(users)
      .values({ supabaseId: signedIn.id, email: signedIn.email!, ...namesFrom(signedIn) })
      .onConflictDoNothing({ target: users.supabaseId });
    const [row] = await tx.select().from(users).where(eq(users.supabaseId, signedIn.id)).limit(1);
    if (!row) throw conflict("An account with this email already exists");

    await tx
      .update(bookings)
      .set({ userId: row.id })
      .where(and(sql`lower(${bookings.primaryContactEmail}) = lower(${row.email})`, isNull(bookings.userId)));
    return row;
  });
  return present(created);
}

export async function updateProfile(supabaseId: string, body: UpdateBody) {
  const [row] = await db
    .update(users)
    .set({
      ...(body.first_name !== undefined && { firstName: body.first_name }),
      ...(body.last_name !== undefined && { lastName: body.last_name }),
      ...(body.preferred_name !== undefined && { preferredName: body.preferred_name }),
      ...(body.phone_number !== undefined && { phoneNumber: body.phone_number }),
      ...(body.emergency_contact !== undefined && { emergencyContact: body.emergency_contact }),
      ...(body.notification_preference !== undefined && { notificationPreference: body.notification_preference }),
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(eq(users.supabaseId, supabaseId))
    .returning({ id: users.id });
  if (!row) throw notFound("User not found");
}
