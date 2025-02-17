import express from "express";
import "dotenv/config";

import initKnex from "knex";
import configuration from "../knexfile.js";
const knex = initKnex(configuration["development"]);

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const bookings = await knex.select("*").from("bookings");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/account", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId || isNaN(Number(userId))) {
      return res.status(400).json({ message: "Valid User ID is required" });
    }

    const userData = await knex("users")
      .select(
        "first_name",
        "last_name",
        "preferred_name",
        "notification_preference",
        "gift_credit",
        knex.raw(`
          CASE 
            WHEN email IS NULL OR email = '' THEN 'No email provided'
            ELSE LEFT(email, 1) || '****' || SUBSTRING(email FROM POSITION('@' IN email)) 
          END AS email
        `),
        knex.raw(`
          CASE 
            WHEN phone_number IS NULL OR phone_number = '' THEN 'No phone number provided'
            ELSE SUBSTRING(phone_number, 1, 2) || REPEAT('*', LENGTH(phone_number) - 6) || SUBSTRING(phone_number, -4) 
          END AS phone_number
        `),
        knex.raw(`
          CASE 
            WHEN emergency_contact IS NULL OR emergency_contact = '' THEN 'No emergency contact provided'
            ELSE SUBSTRING(emergency_contact, 1, 2) || REPEAT('*', LENGTH(emergency_contact) - 6) || SUBSTRING(emergency_contact, -4) 
          END AS emergency_contact
        `)
      )
      .where("id", userId);

    if (!userData.length) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(userData[0]);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
