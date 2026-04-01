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

        await addBookingsToDatabase(metadata, paymentIntent);
      }
      res.json({ received: true });
    } catch (err) {
      console.error("Webhook signature verification failed.", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

async function addBookingsToDatabase(metadata, paymentIntent) {
  try {
    const userId = metadata.booking_1_user_id
      ? parseInt(metadata.booking_1_user_id)
      : null;

    const user = userId
      ? await knex("users").where({ id: userId }).first()
      : null;

    const indices = [
      ...new Set(
        Object.keys(metadata)
          .filter((k) => k.startsWith("booking_"))
          .map((k) => k.split("_")[1])
      ),
    ];

    await knex.transaction(async (trx) => {
      for (const index of indices) {
        const p = `booking_${index}_`;

        const adults = parseInt(metadata[`${p}adults`] || 1);
        const children = parseInt(metadata[`${p}children`] || 0);
        const infants = parseInt(metadata[`${p}infants`] || 0);
        const tourId = parseInt(metadata[`${p}tour_id`]);

        const tour = await trx("tours")
          .where("id", tourId)
          .select("price", "featured")
          .first();

        const price = parseFloat(tour?.price ?? 0);
        const totalPrice = adults * price + children * (price * 0.5);
        const conversionRate = parseFloat(metadata.conversion_rate ?? 1);
        const finalPriceConverted =
          (tour?.featured ? totalPrice * 0.9 : totalPrice) * conversionRate;

        const [{ max }] = await trx("bookings").max("id as max");
        const nextId = (max || 0) + 1;
        const bookingReference = `BK-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 6)
          .toUpperCase()}`;

        const [booking] = await trx("bookings")
          .insert({
            user_id: userId,
            tour_id: tourId,
            time_slot_id: parseInt(metadata[`${p}time_slot_id`]),
            tour_date: metadata[`${p}tour_date`],
            status: "confirmed",
            source: "website",
            primary_contact_name:
              metadata[`${p}contact_name`] ||
              (user ? `${user.first_name} ${user.last_name}` : "Web Guest"),
            primary_contact_email:
              metadata[`${p}contact_email`] || user?.email || null,
            primary_contact_phone:
              metadata[`${p}contact_phone`] || user?.phone_number || null,
            language: metadata[`${p}language`] ?? "en",
            booking_reference: bookingReference,
            total_price: finalPriceConverted,
            is_custom_tour: false,
            created_at: new Date(),
            updated_at: new Date(),
            notes: metadata[`${p}special_requirements`] ?? null,
          })
          .returning("*");

        const bookingId = booking.id;

        await trx("booking_guests").insert({
          booking_id: bookingId,
          adults,
          children,
          infants,
        });

        await trx("booking_guest_names").insert({
          booking_id: bookingId,
          full_name:
            metadata[`${p}contact_name`] ||
            (user ? `${user.first_name} ${user.last_name}` : "Web Guest"),
        });

        const amountPaid = paymentIntent.amount / 100;
        await trx("booking_payments").insert({
          booking_id: bookingId,
          method: "card",
          status: "paid",
          amount: amountPaid,
          paid_at: new Date(),
          notes: `Stripe payment ${paymentIntent.id}`,
        });
      }
    });

    console.log("✅ Booking, guests, names and payment saved.");
  } catch (error) {
    console.error("❌ Transaction Error:", error.message);
    throw error;
  }
}

export default router;
