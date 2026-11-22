import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { startApp } from "../../test/app.js";
import { db, resetDb } from "../../test/db.js";
import { makeUser } from "../../test/fixtures.js";
import { bookings, users } from "../../db/drizzle/schema.js";
import profileRoutes from "./profile.routes.js";

// Supabase decides who a token belongs to; the tests only pick the answer.
const supabase = vi.hoisted(() => ({
  tokens: {} as Record<string, { id: string; email: string; user_metadata?: Record<string, string> }>,
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: {
      getUser: async (token: string) => {
        const user = supabase.tokens[token];
        return user ? { data: { user }, error: null } : { data: { user: null }, error: { message: "bad token" } };
      },
    },
  }),
}));

const ME = "11111111-1111-4111-8111-111111111111";
const NEW = "44444444-4444-4444-8444-444444444444";

let app: Awaited<ReturnType<typeof startApp>>;
let anonymous: typeof app;
let newcomer: typeof app;
beforeAll(async () => {
  supabase.tokens["me-token"] = { id: ME, email: "ayla@example.test" };
  supabase.tokens["new-token"] = { id: NEW, email: "newcomer@example.test", user_metadata: { full_name: "Nova Star Light" } };
  app = await startApp(profileRoutes, { headers: { authorization: "Bearer me-token" } });
  newcomer = await startApp(profileRoutes, { headers: { authorization: "Bearer new-token" } });
  anonymous = await startApp(profileRoutes);
});
afterAll(async () => {
  await Promise.all([app.close(), newcomer.close(), anonymous.close()]);
});
beforeEach(async () => {
  await resetDb();
  await makeUser({
    firstName: "Ayla", lastName: "Demir", email: "ayla@example.test", supabaseId: ME,
    phoneNumber: "+905551234567", emergencyContact: "+905559876543", preferredName: "Ay",
  });
});

describe("GET /profile", () => {
  it("returns my profile with email, phone and emergency contact masked", async () => {
    const res = await app.get("/profile");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: expect.any(Number),
      first_name: "Ayla",
      last_name: "Demir",
      preferred_name: "Ay",
      notification_preference: true,
      gift_credit: "0.00",
      email: "a****@example.test",
      phone_number: "+9*******4567",
      emergency_contact: "+9*******6543",
    });
  });

  it("creates the profile on first sign-in, and attaches earlier guest bookings with the same email", async () => {
    await db.insert(bookings).values({
      tourDate: "2026-10-05", isCustomTour: true, startTime: "09:00:00", endTime: "13:00:00", primaryContactName: "Nova",
      primaryContactEmail: "newcomer@example.test", status: "confirmed", source: "website", bookingReference: "BK-N-1",
    });
    const res = await newcomer.get("/profile");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ first_name: "Nova", last_name: "Star Light", phone_number: "No phone number provided", emergency_contact: "Not provided" });

    const [created] = await db.select().from(users).where(eq(users.supabaseId, NEW));
    expect(created.email).toBe("newcomer@example.test");
    const [booking] = await db.select().from(bookings);
    expect(booking.userId).toBe(created.id);
  });

  it("needs a valid token", async () => {
    expect((await anonymous.get("/profile")).status).toBe(401);
  });
});

describe("PUT /profile", () => {
  it("updates only the fields that are sent", async () => {
    const res = await app.put("/profile", { preferred_name: "Aylo", notification_preference: false });
    expect(res.status).toBe(200);
    const [row] = await db.select().from(users).where(eq(users.supabaseId, ME));
    expect(row).toMatchObject({ preferredName: "Aylo", notificationPreference: false, firstName: "Ayla" });
  });

  it("refuses an empty update and anonymous callers", async () => {
    expect((await app.put("/profile", {})).status).toBe(400);
    expect((await anonymous.put("/profile", { preferred_name: "x" })).status).toBe(401);
  });

  it("does not let a guest set their own gift credit", async () => {
    await app.put("/profile", { preferred_name: "Aylo", gift_credit: "9999.00" });
    const [row] = await db.select().from(users).where(eq(users.supabaseId, ME));
    expect(row.giftCredit).toBe("0.00");
  });
});
