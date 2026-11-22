import { db } from "./db.js";
import { tours } from "../db/drizzle/schema.js";

type NewTour = typeof tours.$inferInsert;

/** A valid tour row with every required column filled. Override what the test cares about. */
export async function makeTour(overrides: Partial<NewTour> = {}) {
  const [row] = await db
    .insert(tours)
    .values({
      tourName: "Old City Walk",
      duration: "4 hours",
      category: "walking",
      landmarks: "Hagia Sophia, Blue Mosque",
      price: "50.00",
      activityLevel: "easy",
      overviewTitle: "Walk the old city",
      overview: "A relaxed walk through Sultanahmet.",
      essentials: "Comfortable shoes",
      includes: "Guide",
      accessibility: "Step-free route available",
      groups: 12,
      minimumOfAttendees: 1,
      additionalCosts: "None",
      ...overrides,
    })
    .returning();
  return row;
}

import { users, tourTimeSlots } from "../db/drizzle/schema.js";

export async function makeUser(overrides: Partial<typeof users.$inferInsert> = {}) {
  const [row] = await db
    .insert(users)
    .values({ firstName: "Test", lastName: "Traveller", email: "traveller@example.test", ...overrides })
    .returning();
  return row;
}

export async function makeTimeSlot(tourId: number, overrides: Partial<typeof tourTimeSlots.$inferInsert> = {}) {
  const [row] = await db
    .insert(tourTimeSlots)
    .values({ tourId, startTime: "09:00:00", endTime: "13:00:00", ...overrides })
    .returning();
  return row;
}
