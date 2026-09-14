import { pgTable, index, foreignKey, unique, check, serial, integer, boolean, date, time, text, varchar, timestamp, numeric, pgPolicy, uuid, smallint, pgView, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const bookingStatus = pgEnum("booking_status", ['pending', 'requires_action', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'refunded'])


export const bookings = pgTable("bookings", {
	id: serial().primaryKey().notNull(),
	tourId: integer("tour_id"),
	isCustomTour: boolean("is_custom_tour").default(false),
	tourDate: date("tour_date").notNull(),
	startTime: time("start_time"),
	endTime: time("end_time"),
	meetingPoint: text("meeting_point"),
	primaryContactName: text("primary_contact_name").notNull(),
	primaryContactEmail: text("primary_contact_email"),
	primaryContactPhone: text("primary_contact_phone"),
	language: varchar({ length: 10 }),
	status: varchar({ length: 32 }).notNull(),
	source: varchar({ length: 32 }).notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	timeSlotId: integer("time_slot_id"),
	bookingReference: text("booking_reference"),
	totalPrice: numeric("total_price", { precision: 10, scale:  2 }),
	cancellationReason: text("cancellation_reason"),
	cancellationNotes: text("cancellation_notes"),
	userId: integer("user_id"),
}, (table) => [
	index("bookings_user_id_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.timeSlotId],
			foreignColumns: [tourTimeSlots.id],
			name: "bookings_time_slot_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "bookings_user_id_fkey"
		}).onDelete("set null"),
	unique("unique_booking_reference").on(table.bookingReference),
	check("booking_time_logic", sql`((is_custom_tour = false) AND (time_slot_id IS NOT NULL) AND (start_time IS NULL) AND (end_time IS NULL)) OR ((is_custom_tour = true) AND (time_slot_id IS NULL) AND (start_time IS NOT NULL) AND (end_time IS NOT NULL))`),
	check("bookings_status_check", sql`(status)::text = ANY ((ARRAY['draft'::character varying, 'pending'::character varying, 'confirmed'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])`),
]);

export const agencyUnavailableDates = pgTable("agency_unavailable_dates", {
	id: serial().primaryKey().notNull(),
	unavailableDate: date("unavailable_date").notNull(),
	reason: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const bookingGuests = pgTable("booking_guests", {
	bookingId: integer("booking_id").primaryKey().notNull(),
	adults: integer().default(1).notNull(),
	children: integer().default(0).notNull(),
	infants: integer().default(0).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [bookings.id],
			name: "booking_guests_booking_id_fkey"
		}).onDelete("cascade"),
]);

export const agencyRecurringUnavailabilities = pgTable("agency_recurring_unavailabilities", {
	id: serial().primaryKey().notNull(),
	dayOfWeek: integer("day_of_week").notNull(),
	reason: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("agency_recurring_unavailabilities_day_of_week_key").on(table.dayOfWeek),
	check("agency_recurring_unavailabilities_day_of_week_check", sql`(day_of_week >= 0) AND (day_of_week <= 6)`),
]);

export const companySettings = pgTable("company_settings", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).default('CityGo Tours'),
	logoUrl: text("logo_url"),
	email: varchar({ length: 255 }),
	phone: varchar({ length: 50 }),
	address: text(),
	city: varchar({ length: 100 }),
	country: varchar({ length: 100 }),
	website: varchar({ length: 255 }),
	timezone: varchar({ length: 100 }).default('Europe/Istanbul'),
	currency: varchar({ length: 10 }).default('EUR'),
	vatNumber: varchar("vat_number", { length: 50 }),
	invoiceFooter: text("invoice_footer"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	bookingWindowMonths: integer("booking_window_months").default(6),
});

export const bookingGuestNames = pgTable("booking_guest_names", {
	id: serial().primaryKey().notNull(),
	bookingId: integer("booking_id").notNull(),
	fullName: text("full_name").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [bookings.id],
			name: "booking_guest_names_booking_id_fkey"
		}).onDelete("cascade"),
]);

export const userRoles = pgTable("user_roles", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id"),
	role: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_roles_user_id_fkey"
		}).onDelete("cascade"),
	unique("user_roles_user_id_unique").on(table.userId),
	pgPolicy("Users can view their own roles", { as: "permissive", for: "select", to: ["authenticated"], using: sql`(( SELECT auth.uid() AS uid) = user_id)` }),
	check("user_roles_role_check", sql`role = ANY (ARRAY['admin'::text, 'manager'::text, 'associate'::text])`),
]);

export const bookingPayments = pgTable("booking_payments", {
	id: serial().primaryKey().notNull(),
	bookingId: integer("booking_id").notNull(),
	method: varchar({ length: 32 }),
	status: varchar({ length: 32 }).notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	paidAt: timestamp("paid_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	notes: text(),
}, (table) => [
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [bookings.id],
			name: "booking_payments_booking_id_fkey"
		}).onDelete("cascade"),
]);

export const bookingsOld = pgTable("bookings_old", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	tourId: integer("tour_id").notNull(),
	bookingDate: date("booking_date").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	adults: integer().default(0).notNull(),
	children: integer().default(0).notNull(),
	infants: integer().default(0).notNull(),
	timeSlotId: integer("time_slot_id"),
	status: bookingStatus().default('pending'),
}, (table) => [
	foreignKey({
			columns: [table.timeSlotId],
			foreignColumns: [tourTimeSlots.id],
			name: "bookings_time_slot_id_fkey"
		}),
	foreignKey({
			columns: [table.tourId],
			foreignColumns: [tours.id],
			name: "bookings_tour_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "bookings_user_id_fkey"
		}).onDelete("cascade"),
]);

export const authors = pgTable("authors", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	bio: text(),
	profileImage: varchar("profile_image", { length: 255 }),
});

export const highlights = pgTable("highlights", {
	id: serial().primaryKey().notNull(),
	tourId: integer("tour_id").notNull(),
	highlight: varchar().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.tourId],
			foreignColumns: [tours.id],
			name: "highlights_tour_id_fkey"
		}).onDelete("cascade"),
]);

export const knexMigrations = pgTable("knex_migrations", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }),
	batch: integer(),
	migrationTime: timestamp("migration_time", { withTimezone: true, mode: 'string' }),
});

export const knexMigrationsLock = pgTable("knex_migrations_lock", {
	index: serial().primaryKey().notNull(),
	isLocked: integer("is_locked"),
});

export const images = pgTable("images", {
	id: serial().primaryKey().notNull(),
	tourId: integer("tour_id").notNull(),
	imagePath: varchar("image_path").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.tourId],
			foreignColumns: [tours.id],
			name: "images_tour_id_fkey"
		}).onDelete("cascade"),
]);

export const articleImages = pgTable("article_images", {
	id: serial().primaryKey().notNull(),
	articleId: integer("article_id"),
	imageUrl: varchar("image_url", { length: 255 }).notNull(),
	caption: varchar({ length: 255 }),
});

export const bookingAssignments = pgTable("booking_assignments", {
	id: serial().primaryKey().notNull(),
	bookingId: integer("booking_id").notNull(),
	guideId: integer("guide_id").notNull(),
	role: varchar({ length: 50 }),
	assignedAt: timestamp("assigned_at", { mode: 'string' }).defaultNow().notNull(),
	assignedBy: integer("assigned_by"),
	status: varchar({ length: 20 }).default('active').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.assignedBy],
			foreignColumns: [users.id],
			name: "booking_assignments_assigned_by_fkey"
		}),
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [bookings.id],
			name: "booking_assignments_booking_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.guideId],
			foreignColumns: [employees.id],
			name: "booking_assignments_guide_id_fkey"
		}).onDelete("restrict"),
]);

export const tourRecurringUnavailabilities = pgTable("tour_recurring_unavailabilities", {
	id: serial().primaryKey().notNull(),
	tourId: integer("tour_id"),
	dayOfWeek: integer("day_of_week"),
	reason: varchar(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.tourId],
			foreignColumns: [tours.id],
			name: "tour_recurring_unavailabilities_tour_id_fkey"
		}),
	check("tour_recurring_unavailabilities_day_of_week_check", sql`(day_of_week >= 0) AND (day_of_week <= 6)`),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	firstName: varchar("first_name", { length: 255 }).notNull(),
	lastName: varchar("last_name", { length: 255 }).notNull(),
	phoneNumber: varchar("phone_number", { length: 255 }),
	email: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	preferredName: varchar("preferred_name", { length: 255 }),
	emergencyContact: varchar("emergency_contact", { length: 255 }),
	notificationPreference: boolean("notification_preference").default(true),
	giftCredit: numeric("gift_credit", { precision: 10, scale:  2 }).default('0.00'),
	supabaseId: uuid("supabase_id"),
	country: varchar({ length: 100 }),
}, (table) => [
	unique("users_email_key").on(table.email),
	unique("users_supabase_id_key").on(table.supabaseId),
]);

export const tours = pgTable("tours", {
	id: serial().primaryKey().notNull(),
	tourName: varchar("tour_name").notNull(),
	duration: varchar().notNull(),
	category: varchar().notNull(),
	landmarks: varchar().notNull(),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	activityLevel: varchar("activity_level").notNull(),
	overviewTitle: varchar("overview_title").notNull(),
	overview: text().notNull(),
	essentials: varchar().notNull(),
	includes: varchar().notNull(),
	accessibility: varchar().notNull(),
	groups: integer().notNull(),
	minimumOfAttendees: integer("minimum_of_attendees").notNull(),
	additionalCosts: varchar("additional_costs").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	slug: text(),
	bestSeller: boolean("best_seller").default(false).notNull(),
	featured: boolean(),
	status: varchar({ length: 20 }).default('active').notNull(),
}, (table) => [
	unique("tours_slug_key").on(table.slug),
]);

export const tourUnavailableDates = pgTable("tour_unavailable_dates", {
	id: serial().primaryKey().notNull(),
	tourId: integer("tour_id"),
	unavailableDate: date("unavailable_date").notNull(),
	reason: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.tourId],
			foreignColumns: [tours.id],
			name: "tour_unavailable_dates_tour_id_fkey"
		}),
]);

export const tourTimeSlots = pgTable("tour_time_slots", {
	id: serial().primaryKey().notNull(),
	tourId: integer("tour_id").notNull(),
	startTime: time("start_time").notNull(),
	endTime: time("end_time").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.tourId],
			foreignColumns: [tours.id],
			name: "fk_tour_time_slots_tour"
		}).onDelete("cascade"),
]);

export const articles = pgTable("articles", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	content: text().notNull(),
	authorId: integer("author_id"),
	category: varchar({ length: 100 }).notNull(),
	datePosted: timestamp("date_posted", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	readTime: integer("read_time").generatedAlwaysAs(sql`(length(content) / 1200)`),
	slug: varchar({ length: 255 }).notNull(),
	description: text(),
}, (table) => [
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [authors.id],
			name: "articles_author_id_fkey"
		}).onDelete("cascade"),
	unique("slug_unique").on(table.slug),
]);

export const tourItineraryCoordinates = pgTable("tour_itinerary_coordinates", {
	id: serial().primaryKey().notNull(),
	tourId: integer("tour_id").notNull(),
	order: integer().notNull(),
	latitude: numeric({ precision: 10, scale:  8 }).notNull(),
	longitude: numeric({ precision: 11, scale:  8 }).notNull(),
	name: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.tourId],
			foreignColumns: [tours.id],
			name: "fk_tour_itinerary_tour"
		}).onDelete("cascade"),
]);

export const bookingActivityLog = pgTable("booking_activity_log", {
	id: serial().primaryKey().notNull(),
	bookingId: integer("booking_id").notNull(),
	action: varchar({ length: 50 }).notNull(),
	message: text(),
	actorType: varchar("actor_type", { length: 20 }).notNull(),
	actorId: integer("actor_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [bookings.id],
			name: "booking_activity_log_booking_id_fkey"
		}).onDelete("cascade"),
]);

export const reviews = pgTable("reviews", {
	id: serial().primaryKey().notNull(),
	bookingId: integer("booking_id").notNull(),
	tourId: integer("tour_id").notNull(),
	userId: integer("user_id").notNull(),
	rating: smallint().notNull(),
	title: varchar({ length: 120 }),
	body: text().notNull(),
	photos: text().array().default([""]),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("reviews_tour_id_idx").using("btree", table.tourId.asc().nullsLast().op("int4_ops")),
	index("reviews_user_id_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [bookings.id],
			name: "reviews_booking_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tourId],
			foreignColumns: [tours.id],
			name: "reviews_tour_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "reviews_user_fkey"
		}).onDelete("cascade"),
	unique("reviews_booking_unique").on(table.bookingId),
	check("reviews_rating_check", sql`(rating >= 1) AND (rating <= 5)`),
]);

export const employees = pgTable("employees", {
	id: serial().primaryKey().notNull(),
	firstName: varchar("first_name", { length: 255 }),
	lastName: varchar("last_name", { length: 255 }),
	position: varchar({ length: 100 }),
	profileImage: varchar("profile_image", { length: 255 }),
	status: varchar({ length: 100 }),
	email: varchar({ length: 255 }),
	phone: varchar({ length: 20 }),
	joinDate: timestamp("join_date", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	lastActivity: timestamp("last_activity", { mode: 'string' }),
	workEmail: varchar("work_email", { length: 255 }),
	notes: text(),
	shiftStart: time("shift_start"),
	shiftEnd: time("shift_end"),
	availabilityOverride: varchar("availability_override", { length: 50 }),
	overrideUntil: timestamp("override_until", { mode: 'string' }),
	dateOfBirth: date("date_of_birth"),
	nationality: varchar({ length: 100 }),
	employmentType: varchar("employment_type", { length: 50 }),
	contractStart: date("contract_start"),
	languages: text().array(),
	licences: text().array(),
	education: text(),
	skills: text().array(),
	emergencyContactName: varchar("emergency_contact_name", { length: 255 }),
	emergencyContactPhone: varchar("emergency_contact_phone", { length: 50 }),
	emergencyContactRelation: varchar("emergency_contact_relation", { length: 100 }),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	notifNewBooking: boolean("notif_new_booking").default(true),
	notifCancellation: boolean("notif_cancellation").default(true),
	notifDailySchedule: boolean("notif_daily_schedule").default(false),
	notifUnassignedTours: boolean("notif_unassigned_tours").default(true),
}, (table) => [
	unique("employees_email_key").on(table.email),
]);

export const passwordResetTokens = pgTable("password_reset_tokens", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	token: varchar({ length: 255 }).notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	usedAt: timestamp("used_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_password_reset_tokens_token").using("btree", table.token.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "password_reset_tokens_user_id_fkey"
		}).onDelete("cascade"),
	unique("password_reset_tokens_token_key").on(table.token),
]);

export const tourActivityLog = pgTable("tour_activity_log", {
	id: serial().primaryKey().notNull(),
	tourId: integer("tour_id").notNull(),
	action: varchar({ length: 50 }).notNull(),
	message: text().notNull(),
	actorId: integer("actor_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.actorId],
			foreignColumns: [employees.id],
			name: "tour_activity_log_actor_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.tourId],
			foreignColumns: [tours.id],
			name: "tour_activity_log_tour_id_fkey"
		}).onDelete("cascade"),
]);

export const tasks = pgTable("tasks", {
	id: serial().primaryKey().notNull(),
	title: varchar().notNull(),
	description: text(),
	type: varchar().default('general').notNull(),
	bookingId: integer("booking_id"),
	assignedTo: integer("assigned_to"),
	createdBy: integer("created_by"),
	priority: varchar().default('normal').notNull(),
	status: varchar().default('open').notNull(),
	dueDate: timestamp("due_date", { mode: 'string' }),
	isAutoGenerated: boolean("is_auto_generated").default(false),
	archivedAt: timestamp("archived_at", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	completedBy: integer("completed_by"),
}, (table) => [
	foreignKey({
			columns: [table.assignedTo],
			foreignColumns: [employees.id],
			name: "tasks_assigned_to_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [bookings.id],
			name: "tasks_booking_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.completedBy],
			foreignColumns: [employees.id],
			name: "tasks_completed_by_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [employees.id],
			name: "tasks_created_by_fkey"
		}).onDelete("set null"),
]);

export const taskComments = pgTable("task_comments", {
	id: serial().primaryKey().notNull(),
	taskId: integer("task_id").notNull(),
	authorId: integer("author_id"),
	content: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [employees.id],
			name: "task_comments_author_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [tasks.id],
			name: "task_comments_task_id_fkey"
		}).onDelete("cascade"),
]);
export const tourRatingSummary = pgView("tour_rating_summary", {	tourId: integer("tour_id"),
	avgRating: numeric("avg_rating"),
	reviewCount: integer("review_count"),
}).with({"securityInvoker":"on"}).as(sql`SELECT reviews.tour_id, round(avg(reviews.rating), 1) AS avg_rating, count(*)::integer AS review_count FROM reviews GROUP BY reviews.tour_id`);