import express from "express";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import initKnex from "knex";
import knexConfig from "../knexfile.js";
const knex = initKnex(knexConfig[process.env.NODE_ENV || "development"]);
import "dotenv/config";
const router = express.Router();
router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    console.log("Webhook hit");
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      console.log("Stripe Event:", event.type);
      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        console.log("Event data object:", paymentIntent);
        const metadata = paymentIntent.metadata;

        console.log("Metadata received:", metadata);

        if (!metadata || !metadata.booking_1_user_id) {
          throw new Error("Metadata missing or invalid");
        }

        await addBookingsToDatabase(metadata);
      }
      res.json({ received: true });
    } catch (err) {
      console.error("Webhook signature verification failed.", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

async function addBookingsToDatabase(metadata) {
  console.log("Adding bookings to database:", metadata);
  try {
    const bookings = new Set();

    for (let key of Object.keys(metadata)) {
      if (key.startsWith("booking_")) {
        const index = key.split("_")[1];
        const bookingEntry = {
          user_id: metadata[`booking_${index}_user_id`],
          tour_id: metadata[`booking_${index}_tour_id`],
          time_slot_id: metadata[`booking_${index}_time_slot_id`],
          booking_date: metadata[`booking_${index}_booking_date`],
          adults: Number(metadata[`booking_${index}_adults`]),
          children: Number(metadata[`booking_${index}_children`]),
          infants: Number(metadata[`booking_${index}_infants`]),
          created_at: new Date(),
          updated_at: new Date(),
        };
        bookings.add(JSON.stringify(bookingEntry));
      }
    }

    const uniqueBookings = Array.from(bookings).map((booking) =>
      JSON.parse(booking)
    );

    if (uniqueBookings.length > 0) {
      await knex("bookings").insert(uniqueBookings);
    }
  } catch (error) {
    console.error("Error adding bookings to database:", error);
    throw error;
  }
}

export default router;
