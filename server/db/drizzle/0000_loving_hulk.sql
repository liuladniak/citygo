-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."booking_status" AS ENUM('pending', 'requires_action', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'refunded');--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"tour_id" integer,
	"is_custom_tour" boolean DEFAULT false,
	"tour_date" date NOT NULL,
	"start_time" time,
	"end_time" time,
	"meeting_point" text,
	"primary_contact_name" text NOT NULL,
	"primary_contact_email" text,
	"primary_contact_phone" text,
	"language" varchar(10),
	"status" varchar(32) NOT NULL,
	"source" varchar(32) NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"time_slot_id" integer,
	"booking_reference" text,
	"total_price" numeric(10, 2),
	"cancellation_reason" text,
	"cancellation_notes" text,
	"user_id" integer,
	CONSTRAINT "unique_booking_reference" UNIQUE("booking_reference"),
	CONSTRAINT "booking_time_logic" CHECK (((is_custom_tour = false) AND (time_slot_id IS NOT NULL) AND (start_time IS NULL) AND (end_time IS NULL)) OR ((is_custom_tour = true) AND (time_slot_id IS NULL) AND (start_time IS NOT NULL) AND (end_time IS NOT NULL))),
	CONSTRAINT "bookings_status_check" CHECK ((status)::text = ANY ((ARRAY['draft'::character varying, 'pending'::character varying, 'confirmed'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[]))
);
--> statement-breakpoint
ALTER TABLE "bookings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "agency_unavailable_dates" (
	"id" serial PRIMARY KEY NOT NULL,
	"unavailable_date" date NOT NULL,
	"reason" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "agency_unavailable_dates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "booking_guests" (
	"booking_id" integer PRIMARY KEY NOT NULL,
	"adults" integer DEFAULT 1 NOT NULL,
	"children" integer DEFAULT 0 NOT NULL,
	"infants" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booking_guests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "agency_recurring_unavailabilities" (
	"id" serial PRIMARY KEY NOT NULL,
	"day_of_week" integer NOT NULL,
	"reason" varchar(255),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "agency_recurring_unavailabilities_day_of_week_key" UNIQUE("day_of_week"),
	CONSTRAINT "agency_recurring_unavailabilities_day_of_week_check" CHECK ((day_of_week >= 0) AND (day_of_week <= 6))
);
--> statement-breakpoint
ALTER TABLE "agency_recurring_unavailabilities" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "company_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) DEFAULT 'CityGo Tours',
	"logo_url" text,
	"email" varchar(255),
	"phone" varchar(50),
	"address" text,
	"city" varchar(100),
	"country" varchar(100),
	"website" varchar(255),
	"timezone" varchar(100) DEFAULT 'Europe/Istanbul',
	"currency" varchar(10) DEFAULT 'EUR',
	"vat_number" varchar(50),
	"invoice_footer" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"booking_window_months" integer DEFAULT 6
);
--> statement-breakpoint
ALTER TABLE "company_settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "booking_guest_names" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"full_name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booking_guest_names" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"role" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "user_roles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "user_roles_role_check" CHECK (role = ANY (ARRAY['admin'::text, 'manager'::text, 'associate'::text]))
);
--> statement-breakpoint
ALTER TABLE "user_roles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "booking_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"method" varchar(32),
	"status" varchar(32) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "booking_payments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "bookings_old" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"tour_id" integer NOT NULL,
	"booking_date" date NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"adults" integer DEFAULT 0 NOT NULL,
	"children" integer DEFAULT 0 NOT NULL,
	"infants" integer DEFAULT 0 NOT NULL,
	"time_slot_id" integer,
	"status" "booking_status" DEFAULT 'pending'
);
--> statement-breakpoint
ALTER TABLE "bookings_old" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "authors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"bio" text,
	"profile_image" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "authors" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "highlights" (
	"id" serial PRIMARY KEY NOT NULL,
	"tour_id" integer NOT NULL,
	"highlight" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "highlights" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "knex_migrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"batch" integer,
	"migration_time" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "knex_migrations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "knex_migrations_lock" (
	"index" serial PRIMARY KEY NOT NULL,
	"is_locked" integer
);
--> statement-breakpoint
ALTER TABLE "knex_migrations_lock" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "images" (
	"id" serial PRIMARY KEY NOT NULL,
	"tour_id" integer NOT NULL,
	"image_path" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "images" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "article_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"article_id" integer,
	"image_url" varchar(255) NOT NULL,
	"caption" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "article_images" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "booking_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"guide_id" integer NOT NULL,
	"role" varchar(50),
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"assigned_by" integer,
	"status" varchar(20) DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booking_assignments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tour_recurring_unavailabilities" (
	"id" serial PRIMARY KEY NOT NULL,
	"tour_id" integer,
	"day_of_week" integer,
	"reason" varchar,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "tour_recurring_unavailabilities_day_of_week_check" CHECK ((day_of_week >= 0) AND (day_of_week <= 6))
);
--> statement-breakpoint
ALTER TABLE "tour_recurring_unavailabilities" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"phone_number" varchar(255),
	"email" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"preferred_name" varchar(255),
	"emergency_contact" varchar(255),
	"notification_preference" boolean DEFAULT true,
	"gift_credit" numeric(10, 2) DEFAULT '0.00',
	"supabase_id" uuid,
	"country" varchar(100),
	CONSTRAINT "users_email_key" UNIQUE("email"),
	CONSTRAINT "users_supabase_id_key" UNIQUE("supabase_id")
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tours" (
	"id" serial PRIMARY KEY NOT NULL,
	"tour_name" varchar NOT NULL,
	"duration" varchar NOT NULL,
	"category" varchar NOT NULL,
	"landmarks" varchar NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"activity_level" varchar NOT NULL,
	"overview_title" varchar NOT NULL,
	"overview" text NOT NULL,
	"essentials" varchar NOT NULL,
	"includes" varchar NOT NULL,
	"accessibility" varchar NOT NULL,
	"groups" integer NOT NULL,
	"minimum_of_attendees" integer NOT NULL,
	"additional_costs" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"slug" text,
	"best_seller" boolean DEFAULT false NOT NULL,
	"featured" boolean,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	CONSTRAINT "tours_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "tours" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tour_unavailable_dates" (
	"id" serial PRIMARY KEY NOT NULL,
	"tour_id" integer,
	"unavailable_date" date NOT NULL,
	"reason" varchar(255),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "tour_unavailable_dates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tour_time_slots" (
	"id" serial PRIMARY KEY NOT NULL,
	"tour_id" integer NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "tour_time_slots" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"author_id" integer,
	"category" varchar(100) NOT NULL,
	"date_posted" timestamp DEFAULT CURRENT_TIMESTAMP,
	"read_time" integer GENERATED ALWAYS AS ((length(content) / 1200)) STORED,
	"slug" varchar(255) NOT NULL,
	"description" text,
	CONSTRAINT "slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "articles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tour_itinerary_coordinates" (
	"id" serial PRIMARY KEY NOT NULL,
	"tour_id" integer NOT NULL,
	"order" integer NOT NULL,
	"latitude" numeric(10, 8) NOT NULL,
	"longitude" numeric(11, 8) NOT NULL,
	"name" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "tour_itinerary_coordinates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "booking_activity_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"action" varchar(50) NOT NULL,
	"message" text,
	"actor_type" varchar(20) NOT NULL,
	"actor_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booking_activity_log" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"tour_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"rating" smallint NOT NULL,
	"title" varchar(120),
	"body" text NOT NULL,
	"photos" text[] DEFAULT '{""}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "reviews_booking_unique" UNIQUE("booking_id"),
	CONSTRAINT "reviews_rating_check" CHECK ((rating >= 1) AND (rating <= 5))
);
--> statement-breakpoint
ALTER TABLE "reviews" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "employees" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"position" varchar(100),
	"profile_image" varchar(255),
	"status" varchar(100),
	"email" varchar(255),
	"phone" varchar(20),
	"join_date" timestamp DEFAULT CURRENT_TIMESTAMP,
	"last_activity" timestamp,
	"work_email" varchar(255),
	"notes" text,
	"shift_start" time,
	"shift_end" time,
	"availability_override" varchar(50),
	"override_until" timestamp,
	"date_of_birth" date,
	"nationality" varchar(100),
	"employment_type" varchar(50),
	"contract_start" date,
	"languages" text[],
	"licences" text[],
	"education" text,
	"skills" text[],
	"emergency_contact_name" varchar(255),
	"emergency_contact_phone" varchar(50),
	"emergency_contact_relation" varchar(100),
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"notif_new_booking" boolean DEFAULT true,
	"notif_cancellation" boolean DEFAULT true,
	"notif_daily_schedule" boolean DEFAULT false,
	"notif_unassigned_tours" boolean DEFAULT true,
	CONSTRAINT "employees_email_key" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "employees" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "password_reset_tokens_token_key" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tour_activity_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"tour_id" integer NOT NULL,
	"action" varchar(50) NOT NULL,
	"message" text NOT NULL,
	"actor_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "tour_activity_log" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"type" varchar DEFAULT 'general' NOT NULL,
	"booking_id" integer,
	"assigned_to" integer,
	"created_by" integer,
	"priority" varchar DEFAULT 'normal' NOT NULL,
	"status" varchar DEFAULT 'open' NOT NULL,
	"due_date" timestamp,
	"is_auto_generated" boolean DEFAULT false,
	"archived_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"completed_by" integer
);
--> statement-breakpoint
ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "task_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"author_id" integer,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "task_comments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_time_slot_fkey" FOREIGN KEY ("time_slot_id") REFERENCES "public"."tour_time_slots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_guests" ADD CONSTRAINT "booking_guests_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_guest_names" ADD CONSTRAINT "booking_guest_names_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_payments" ADD CONSTRAINT "booking_payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings_old" ADD CONSTRAINT "bookings_time_slot_id_fkey" FOREIGN KEY ("time_slot_id") REFERENCES "public"."tour_time_slots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings_old" ADD CONSTRAINT "bookings_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings_old" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "highlights" ADD CONSTRAINT "highlights_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_assignments" ADD CONSTRAINT "booking_assignments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_assignments" ADD CONSTRAINT "booking_assignments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_assignments" ADD CONSTRAINT "booking_assignments_guide_id_fkey" FOREIGN KEY ("guide_id") REFERENCES "public"."employees"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_recurring_unavailabilities" ADD CONSTRAINT "tour_recurring_unavailabilities_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_unavailable_dates" ADD CONSTRAINT "tour_unavailable_dates_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_time_slots" ADD CONSTRAINT "fk_tour_time_slots_tour" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_itinerary_coordinates" ADD CONSTRAINT "fk_tour_itinerary_tour" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_activity_log" ADD CONSTRAINT "booking_activity_log_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_tour_fkey" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_activity_log" ADD CONSTRAINT "tour_activity_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_activity_log" ADD CONSTRAINT "tour_activity_log_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_completed_by_fkey" FOREIGN KEY ("completed_by") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookings_user_id_idx" ON "bookings" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "reviews_tour_id_idx" ON "reviews" USING btree ("tour_id" int4_ops);--> statement-breakpoint
CREATE INDEX "reviews_user_id_idx" ON "reviews" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_password_reset_tokens_token" ON "password_reset_tokens" USING btree ("token" text_ops);--> statement-breakpoint
CREATE VIEW "public"."tour_rating_summary" WITH (security_invoker = on) AS (SELECT reviews.tour_id, round(avg(reviews.rating), 1) AS avg_rating, count(*)::integer AS review_count FROM reviews GROUP BY reviews.tour_id);--> statement-breakpoint
CREATE POLICY "Users can view their own roles" ON "user_roles" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((( SELECT auth.uid() AS uid) = user_id));
*/