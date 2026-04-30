import express from "express";
import initKnex from "knex";
import knexConfig from "../knexfile.js";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const router = express.Router();
const knex = initKnex(knexConfig[process.env.NODE_ENV || "development"]);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).send("Authorization token required.");
  }
  const token = authHeader.split(" ")[1];
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) {
    return res.status(401).send("Invalid or expired token.");
  }
  req.userId = user.id;
  next();
};

router.get("/profile", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("Authorization required");
  }

  const token = authHeader.split(" ")[1];
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) {
    return res.status(401).send("Invalid token");
  }

  try {
    let userData = await knex("users")
      .where({ supabase_id: user.id })
      .select(
        "id",
        "first_name",
        "last_name",
        "preferred_name",
        "notification_preference",
        "gift_credit",
        knex.raw(`CASE WHEN email IS NULL OR email = '' THEN 'No email provided'
          ELSE LEFT(email, 1) || '****' || SUBSTRING(email FROM POSITION('@' IN email))
          END AS email`),
        knex.raw(`CASE WHEN phone_number IS NULL OR phone_number = '' THEN 'No phone number provided'
          ELSE SUBSTRING(phone_number, 1, 2) || REPEAT('*', GREATEST(LENGTH(phone_number) - 6, 0)) || SUBSTRING(phone_number, LENGTH(phone_number) - 3, 4)
          END AS phone_number`),
        knex.raw(`CASE WHEN emergency_contact IS NULL OR emergency_contact = '' THEN 'Not provided'
          ELSE SUBSTRING(emergency_contact, 1, 2) || REPEAT('*', GREATEST(LENGTH(emergency_contact) - 6, 0)) || SUBSTRING(emergency_contact, LENGTH(emergency_contact) - 3, 4)
          END AS emergency_contact`)
      )
      .first();

    if (!userData) {
      const firstName =
        user.user_metadata?.first_name ||
        user.user_metadata?.full_name?.split(" ")[0] ||
        "";
      const lastName =
        user.user_metadata?.last_name ||
        user.user_metadata?.full_name?.split(" ").slice(1).join(" ") ||
        "";

      const [newUser] = await knex("users")
        .insert({
          supabase_id: user.id,
          email: user.email,
          first_name: firstName,
          last_name: lastName,
        })
        .returning("*");

      await knex("bookings")
        .where("primary_contact_email", user.email)
        .whereNull("user_id")
        .update({ user_id: newUser.id });

      userData = {
        id: newUser.id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        preferred_name: null,
        notification_preference: true,
        gift_credit: "0.00",
        email: newUser.email,
        phone_number: "No phone number provided",
        emergency_contact: "Not provided",
      };
    }

    res.status(200).json(userData);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.put("/profile", verifyToken, async (req, res) => {
  const {
    first_name,
    last_name,
    preferred_name,
    phone_number,
    emergency_contact,
    notification_preference,
    gift_credit,
  } = req.body;

  const updatedUser = {};
  if (first_name) updatedUser.first_name = first_name;
  if (last_name) updatedUser.last_name = last_name;
  if (preferred_name !== undefined) updatedUser.preferred_name = preferred_name;
  if (phone_number !== undefined) updatedUser.phone_number = phone_number;
  if (emergency_contact !== undefined)
    updatedUser.emergency_contact = emergency_contact;
  if (notification_preference !== undefined)
    updatedUser.notification_preference = notification_preference;
  if (gift_credit !== undefined) updatedUser.gift_credit = gift_credit;

  if (Object.keys(updatedUser).length === 0) {
    return res.status(400).send("At least one field must be updated");
  }

  try {
    await knex("users").where({ supabase_id: req.userId }).update(updatedUser);
    res.status(200).send("User profile updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error while updating user profile");
  }
});

router.post("/test-login", async (req, res) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: process.env.TEST_USER_EMAIL,
      password: process.env.TEST_USER_PASSWORD,
    });
    if (error) throw error;
    res.status(200).json({
      message: "Test user logged in successfully",
      token: data.session.access_token,
      expiresIn: data.session.expires_in,
    });
  } catch (err) {
    console.error("Test login error:", err);
    res.status(500).send("Server error");
  }
});

export default router;
