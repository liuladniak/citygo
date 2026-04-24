import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import initKnex from "knex";
import knexConfig from "../knexfile.js";
import "dotenv/config";
import { sendWelcome } from "../services/emailService.js";

const knex = initKnex(knexConfig[process.env.NODE_ENV || "development"]);
console.log("Passport config loading...");
console.log("CLIENT_ID exists:", !!process.env.GOOGLE_CLIENT_ID);
console.log("CLIENT_SECRET exists:", !!process.env.GOOGLE_CLIENT_SECRET);
console.log("CALLBACK_URL:", process.env.GOOGLE_CALLBACK_URL);
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value.toLowerCase();
        const firstName = profile.name.givenName;
        const lastName = profile.name.familyName;
        const googleId = profile.id;

        let user = await knex("users").where({ email }).first();

        if (user) {
          if (!user.google_id) {
            await knex("users")
              .where({ email })
              .update({ google_id: googleId });
          }
          return done(null, user);
        }

        const [newUser] = await knex("users")
          .insert({
            first_name: firstName,
            last_name: lastName,
            email,
            google_id: googleId,
          })
          .returning("*");

        await knex("bookings")
          .where("primary_contact_email", email)
          .whereNull("user_id")
          .update({ user_id: newUser.id });

        sendWelcome({ to: email, name: firstName }).catch((err) =>
          console.error("Welcome email (Google) failed:", err)
        );

        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await knex("users").where({ id }).first();
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
