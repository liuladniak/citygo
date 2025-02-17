import express from "express";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import initKnex from "knex";
import knexConfig from "../knexfile.js";
const knex = initKnex(knexConfig[process.env.NODE_ENV || "development"]);

const router = express.Router();
router.post("/", async (req, res) => {
  console.log("Webhook hit");
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log("Stripe Event:", event.type);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const metadata = session.metadata;

      console.log("Metadata received:", metadata);

      if (!metadata || !metadata.user_id) {
        throw new Error("Metadata missing or invalid");
      }

      await addBookingToDatabase(metadata);
    }
    res.json({ received: true });
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

async function addBookingToDatabase(metadata) {
  await knex("bookings").insert({
    user_id: parseInt(metadata.user_id),
    tour_id: parseInt(metadata.tour_id),
    time_slot_id: parseInt(metadata.time_slot_id),
    booking_date: metadata.booking_date,
    adults: parseInt(metadata.adults),
    children: parseInt(metadata.children),
    infants: parseInt(metadata.infants),
    created_at: new Date(),
    updated_at: new Date(),
  });
}

export default router;
