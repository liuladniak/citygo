// Every environment variable the API reads, checked once at startup.
// In production a missing required variable stops the server with a clear list;
// in development and tests nothing is required, so unit tests need no .env file.
import "dotenv/config";
import { z } from "zod";

const flag = z
  .string()
  .optional()
  .transform((v) => v === "true");

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8080),

  // Database
  DATABASE_URL: z.string().optional(),
  DB_POOL_MAX: z.coerce.number().int().positive().default(10),

  // Supabase (auth)
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_KEY: z.string().optional(),

  // CORS and sockets
  ALLOWED_ORIGINS: z.string().default(""),

  // Payments
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Email and queue
  BREVO_API_KEY: z.string().optional(),
  CONTACT_EMAIL: z.string().optional(),
  REDIS_HOST: z.string().default("redis"),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),

  // Milo
  AI_ENABLED: flag,
  AI_SERVICE_URL: z.string().optional(),
  AI_OWNER_KEY: z.string().optional(),
  AI_DAILY_LIMIT_PER_IP: z.coerce.number().int().nonnegative().default(5),
  AI_DAILY_LIMIT_GLOBAL: z.coerce.number().int().nonnegative().default(150),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),
  MILO_AGENT_NAME: z.string().optional(),
  MILO_CONSOLE_URL: z.string().optional(),

  // Google sign-in
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional(),
});

export type Env = Omit<z.infer<typeof schema>, "ALLOWED_ORIGINS"> & {
  /** ALLOWED_ORIGINS split on commas, trimmed, without trailing slashes. */
  ALLOWED_ORIGINS: string[];
  isProduction: boolean;
};

/** The server cannot work without these, so production refuses to start without them. */
const REQUIRED_IN_PRODUCTION = [
  "DATABASE_URL",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_KEY",
  "ALLOWED_ORIGINS",
  "STRIPE_SECRET_KEY",
] as const;

export function parseEnv(source: Record<string, string | undefined>): Env {
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    const problems = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid environment variables: ${problems}`);
  }

  if (parsed.data.NODE_ENV === "production") {
    const missing = REQUIRED_IN_PRODUCTION.filter((key) => !source[key]?.trim());
    if (missing.length) {
      throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }
  }

  return {
    ...parsed.data,
    ALLOWED_ORIGINS: parsed.data.ALLOWED_ORIGINS.split(",")
      .map((origin) => origin.trim().replace(/\/$/, ""))
      .filter(Boolean),
    isProduction: parsed.data.NODE_ENV === "production",
  };
}

export const env = parseEnv(process.env);
