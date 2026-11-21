import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./drizzle/schema.js";
import { env } from "../config/env.js";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: env.DB_POOL_MAX,
  ssl:
    env.isProduction ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(pool, { schema });
