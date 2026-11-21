// Vitest globalSetup for the database tests (`npm run test:db`).
// Starts a throwaway Postgres, creates the Supabase bits the schema expects
// (auth schema and roles), then builds every table from db/drizzle/schema.ts.
import EmbeddedPostgres from "embedded-postgres";
import { mkdtempSync, chmodSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import net from "node:net";
import { randomBytes } from "node:crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { pushSchema } from "drizzle-kit/api";
import * as fullSchema from "../db/drizzle/schema.js";

// auth.users belongs to Supabase, so it is created by hand below, not pushed.
const { usersInAuth: _authUsers, ...schema } = fullSchema;

const freePort = () =>
  new Promise<number>((resolve, reject) => {
    const srv = net.createServer();
    srv.once("error", reject);
    srv.listen(0, () => {
      const { port } = srv.address() as net.AddressInfo;
      srv.close(() => resolve(port));
    });
  });
const USER = "postgres";
// A new random password for every run; the database is deleted afterwards.
const PASSWORD = randomBytes(16).toString("hex");
const DB = "citygo_test";

export default async function setup() {
  const PORT = await freePort();
  // Postgres refuses to run as root, and the package drops to the postgres
  // user when it is root, so the data directory must be writable by anyone.
  const dir = mkdtempSync(path.join(tmpdir(), "citygo-pg-"));
  chmodSync(dir, 0o777);

  const pg = new EmbeddedPostgres({
    databaseDir: path.join(dir, "data"),
    user: USER,
    password: PASSWORD,
    port: PORT,
    persistent: false,
  });
  await pg.initialise();
  await pg.start();
  const cleanup = async () => {
    await pg.stop();
    rmSync(dir, { recursive: true, force: true });
  };
  try {
    await pg.createDatabase(DB);

    const url = `postgres://${USER}:${PASSWORD}@localhost:${PORT}/${DB}`;
    const pool = new Pool({ connectionString: url });
    await pool.query(`
    create schema if not exists auth;
    create table if not exists auth.users (id uuid primary key default gen_random_uuid(), email text);
    create or replace function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
    do $$ begin
      if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated; end if;
      if not exists (select 1 from pg_roles where rolname='anon') then create role anon; end if;
      if not exists (select 1 from pg_roles where rolname='service_role') then create role service_role; end if;
    end $$;
  `);
    const { apply } = await pushSchema(schema, drizzle(pool), ["public"]);
    await apply();
    await pool.end();

    process.env.DATABASE_URL = url;
  } catch (err) {
    await cleanup();
    throw err;
  }

  return cleanup;
}
