import type { Config } from "drizzle-kit";
import "dotenv/config";

export default {
  out: "./db/drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
