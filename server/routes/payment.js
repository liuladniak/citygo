import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import axios from "axios";
import "dotenv/config";
import initKnex from "knex";
import knexConfig from "../knexfile.js";
const knex = initKnex(knexConfig[process.env.NODE_ENV || "development"]);
const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const CLIENT_URLS = process.env.CLIENT_URLS.split(",");

const getClientUrl = (req) => {
  const origin = req.headers.origin;
  return CLIENT_URLS.includes(origin) ? origin : CLIENT_URLS[0];
};

router.post("/create-payment-intent", async (req, res) => {
  try {
    console.log("Received request to create payment intent", req.body);

    const { bookings, selectedCurrency } = req.body;
    console.log("Bookings as req body on the server", bookings);
    if (!bookings || bookings.length === 0) {
      return res.status(400).json({ error: "No bookings provided." });
    }

    const exchangeRates = await axios
      .get(`https://api.exchangerate-api.com/v4/latest/USD`)
      .catch((err) => {
        console.error("Error fetching exchange rates:", err);
        return null;
      });

    if (!exchangeRates.data.rates[selectedCurrency]) {
      return res.status(400).json({ error: "Unsupported currency" });
    }

    const conversionRate =
      exchangeRates.data.rates[selectedCurrency.toUpperCase()] || 1;

    const tourIds = bookings.map((booking) => booking.tour_id);

    const tours = await knex("tours")
      .select("id", "price", "featured")
      .whereIn("id", tourIds);

    if (tours.length === 0) {
      return res.status(404).json({ error: "No valid tours found." });
    }
    let totalAmount = 0;
    let metadata = {};

    for (const [index, booking] of bookings.entries()) {
      const {
        user_id,
        tour_id,
        time_slot_id,
        tour_date,
        adults,
        children,
        infants,
      } = booking;

      const tour = tours.find((t) => t.id === tour_id);
      if (!tour) {
        return res.status(400).json({ error: `Tour ID ${tour_id} not found.` });
      }

      let { price, featured } = tour;
      const totalPrice = price * adults + price * 0.5 * children;
      totalAmount += featured ? totalPrice * 0.9 : totalPrice;

      const sanitizedBookingDate = new Date(tour_date);
      if (isNaN(sanitizedBookingDate.getTime())) {
        return res.status(400).json({ error: "Invalid booking date format." });
      }

      const prefix = `booking_${index + 1}_`;
      metadata[`${prefix}user_id`] = user_id;
      metadata[`${prefix}tour_id`] = tour_id;
      metadata[`${prefix}time_slot_id`] = time_slot_id;
      metadata[`${prefix}tour_date`] = sanitizedBookingDate
        .toISOString()
        .split("T")[0];
      metadata[`${prefix}adults`] = adults;
      metadata[`${prefix}children`] = children;
      metadata[`${prefix}infants`] = infants;
      metadata[`${prefix}contact_name`] = booking.contact_name ?? "";
      metadata[`${prefix}contact_email`] = booking.contact_email ?? "";
      metadata[`${prefix}language`] = booking.language ?? "en";
      metadata[`${prefix}special_requirements`] =
        booking.special_requirements ?? "";
      metadata["conversion_rate"] = conversionRate.toString();
    }
    console.log("Total Amount:", totalAmount);
    console.log("Metadata intent:", metadata);
    const totalAmountConverted = Math.round(totalAmount * conversionRate * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmountConverted,
      currency: selectedCurrency.toLowerCase(),
      metadata,
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    if (!res.headersSent) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ error: "Failed to create payment intent." });
    }
  }
});

export default router;
