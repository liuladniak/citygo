// The one Knex connection for the whole API. Every file imports this instead of
// creating its own, so there is a single pool. Goes away with the Drizzle migration.
import initKnex from "knex";
import knexConfig from "../knexfile.js";
import { env } from "../config/env.js";

const config = knexConfig[env.NODE_ENV === "test" ? "development" : env.NODE_ENV];

export const knex = initKnex({
  ...config,
  pool: { min: 0, max: env.DB_POOL_MAX },
});
