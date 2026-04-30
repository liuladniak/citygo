// server/scripts/migrateUsersToSupabase.js
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import initKnex from "knex";
import knexConfig from "../knexfile.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
const knex = initKnex(knexConfig[process.env.NODE_ENV || "development"]);

const migrate = async () => {
  const users = await knex("users")
    .whereNull("supabase_id")
    .whereNotNull("email")
    .select("id", "email", "first_name", "last_name");

  console.log(`Migrating ${users.length} users...`);

  for (const user of users) {
    try {
      // create user in Supabase Auth
      // NOTE: they'll need to reset password since we can't migrate hashed passwords
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        email_confirm: true, // skip email confirmation for existing users
        user_metadata: {
          first_name: user.first_name,
          last_name: user.last_name,
        },
      });

      if (error) {
        console.error(`Failed for ${user.email}:`, error.message);
        continue;
      }

      // link supabase_id back to your users table
      await knex("users")
        .where({ id: user.id })
        .update({ supabase_id: data.user.id });

      console.log(`✓ Migrated: ${user.email}`);
    } catch (err) {
      console.error(`Error for ${user.email}:`, err.message);
    }
  }

  console.log("Migration complete.");
  process.exit(0);
};

migrate();
