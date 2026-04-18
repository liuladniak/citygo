import express from "express";
import Stripe from "stripe";
import axios from "axios";
import "dotenv/config";
import initKnex from "knex";
import knexConfig from "../knexfile.js";

const knex = initKnex(knexConfig[process.env.NODE_ENV || "development"]);
const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const CLIENT_URLS = process.env.ALLOWED_ORIGINS.split(",");

const getClientUrl = (req) => {
  const origin = req.headers.origin;
  return CLIENT_URLS.includes(origin) ? origin : CLIENT_URLS[0];
};

const fetchExchangeRate = async (currency) => {
  if (currency.toUpperCase() === "USD") return 1;
  const response = await axios.get(
    "https://api.exchangerate-api.com/v4/latest/USD"
  );
  const rate = response.data.rates[currency.toUpperCase()];
  if (!rate) throw new Error(`Unsupported currency: ${currency}`);
  return rate;
};

const calculateBookingAmount = (tour, adults, children) => {
  const price = parseFloat(tour.price);
  const subtotal = adults * price + children * (price * 0.5);
  return tour.featured ? subtotal * 0.9 : subtotal;
};

const validateGuests = (adults, children, infants) => {
  if (!Number.isInteger(adults) || adults < 1)
    return "At least 1 adult is required per booking";
  if (!Number.isInteger(children) || children < 0)
    return "Invalid children count";
  if (!Number.isInteger(infants) || infants < 0) return "Invalid infants count";
  if (adults + children > 50) return "Guest count exceeds maximum allowed (50)";
  return null;
};

router.post("/cart/quote", async (req, res) => {
  try {
    const { bookings, selectedCurrency = "USD" } = req.body;

    if (!bookings || bookings.length === 0) {
      return res.status(400).json({ error: "No bookings provided" });
    }

    for (const [i, booking] of bookings.entries()) {
      const adults = parseInt(booking.adults);
      const children = parseInt(booking.children ?? 0);
      const infants = parseInt(booking.infants ?? 0);
      const error = validateGuests(adults, children, infants);
      if (error) {
        return res.status(400).json({ error: `Booking ${i + 1}: ${error}` });
      }
    }

    const tourIds = bookings.map((b) => b.tour_id);
    const tours = await knex("tours")
      .select("id", "price", "featured", "tour_name")
      .whereIn("id", tourIds);

    if (tours.length === 0) {
      return res.status(404).json({ error: "No valid tours found" });
    }

    let exchangeRate;
    try {
      exchangeRate = await fetchExchangeRate(selectedCurrency);
    } catch {
      return res
        .status(400)
        .json({ error: `Unsupported currency: ${selectedCurrency}` });
    }

    const breakdown = bookings.map((booking) => {
      const tour = tours.find((t) => t.id === booking.tour_id);
      if (!tour) throw new Error(`Tour ID ${booking.tour_id} not found`);

      const adults = parseInt(booking.adults);
      const children = parseInt(booking.children ?? 0);
      const infants = parseInt(booking.infants ?? 0);
      const price = parseFloat(tour.price);

      const basePrice = price;
      const adultTotal = adults * price;
      const childTotal = children * (price * 0.5);
      const infantTotal = 0;
      const subtotal = adultTotal + childTotal;
      const discount = tour.featured ? subtotal * 0.1 : 0;
      const subtotalAfterDiscount = subtotal - discount;

      const convertedBasePrice = basePrice * exchangeRate;
      const convertedAdultTotal = adultTotal * exchangeRate;
      const convertedChildTotal = childTotal * exchangeRate;
      const convertedDiscount = discount * exchangeRate;
      const convertedSubtotal = subtotalAfterDiscount * exchangeRate;

      return {
        tour_id: tour.id,
        tour_name: tour.tour_name,
        featured: tour.featured,
        guests: { adults, children, infants },
        base_price: convertedBasePrice,
        adult_total: convertedAdultTotal,
        child_total: convertedChildTotal,
        infant_total: infantTotal,
        discount: convertedDiscount,
        subtotal: convertedSubtotal,
      };
    });

    const grandTotal = breakdown.reduce((sum, b) => sum + b.subtotal, 0);

    return res.json({
      breakdown,
      grand_total: grandTotal,
      currency: selectedCurrency.toUpperCase(),
      exchange_rate: exchangeRate,
    });
  } catch (error) {
    console.error("Error generating cart quote:", error);
    return res.status(500).json({ error: "Failed to generate price quote" });
  }
});

router.post("/create-payment-intent", async (req, res) => {
  try {
    const { bookings, selectedCurrency } = req.body;

    if (!bookings || bookings.length === 0) {
      return res.status(400).json({ error: "No bookings provided." });
    }

    for (const [i, booking] of bookings.entries()) {
      const adults = parseInt(booking.adults);
      const children = parseInt(booking.children ?? 0);
      const infants = parseInt(booking.infants ?? 0);
      const error = validateGuests(adults, children, infants);
      if (error) {
        return res.status(400).json({ error: `Booking ${i + 1}: ${error}` });
      }
    }

    let conversionRate;
    try {
      conversionRate = await fetchExchangeRate(selectedCurrency);
    } catch {
      return res.status(400).json({ error: "Unsupported currency" });
    }

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

      totalAmount += calculateBookingAmount(
        tour,
        parseInt(adults),
        parseInt(children)
      );

      const sanitizedBookingDate = new Date(tour_date);
      if (isNaN(sanitizedBookingDate.getTime())) {
        return res.status(400).json({ error: "Invalid booking date format." });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (sanitizedBookingDate < today) {
        return res
          .status(400)
          .json({ error: "Tour date must be in the future." });
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
