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

import { articles, authors, articleImages, bookings } from "../db/drizzle/schema.js";

export async function makeBooking(overrides: Partial<typeof bookings.$inferInsert> = {}) {
  const [row] = await db
    .insert(bookings)
    .values({
      tourDate: "2099-06-01",
      isCustomTour: true, // custom bookings carry their own times; regular ones need a time slot
      startTime: "09:00:00",
      endTime: "13:00:00",
      primaryContactName: "Test Guest",
      status: "confirmed",
      source: "website",
      bookingReference: `BK-TEST-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      ...overrides,
    })
    .returning();
  return row;
}

export async function makeAuthor(overrides: Partial<typeof authors.$inferInsert> = {}) {
  const [row] = await db
    .insert(authors)
    .values({ name: "Mehmet Kaya", bio: "Istanbul local", profileImage: "/authors/mehmet.jpg", ...overrides })
    .returning();
  return row;
}

let articleCount = 0;
export async function makeArticle(overrides: Partial<typeof articles.$inferInsert> = {}) {
  articleCount += 1;
  const [row] = await db
    .insert(articles)
    .values({
      title: `Article ${articleCount}`,
      content: "<p>Body</p>",
      category: "food",
      slug: `article-${articleCount}`,
      description: "Short description",
      ...overrides,
    })
    .returning();
  return row;
}

export async function addArticleImage(articleId: number, imageUrl: string, caption: string | null = null) {
  const [row] = await db.insert(articleImages).values({ articleId, imageUrl, caption }).returning();
  return row;
}

import { bookingAssignments, employees } from "../db/drizzle/schema.js";

let employeeCount = 0;
export async function makeEmployee(overrides: Partial<typeof employees.$inferInsert> = {}) {
  employeeCount += 1;
  const [row] = await db
    .insert(employees)
    .values({
      firstName: "Guide",
      lastName: `Number${employeeCount}`,
      position: "Lead Guide",
      status: "active",
      email: `guide${employeeCount}@example.test`,
      ...overrides,
    })
    .returning();
  return row;
}

export async function assignGuide(bookingId: number, guideId: number, overrides: Partial<typeof bookingAssignments.$inferInsert> = {}) {
  const [row] = await db
    .insert(bookingAssignments)
    .values({ bookingId, guideId, role: "lead_guide", status: "active", ...overrides })
    .returning();
  return row;
}
