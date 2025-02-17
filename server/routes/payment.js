import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const CLIENT_URLS = process.env.CLIENT_URLS.split(",");

const getClientUrl = (req) => {
  const origin = req.headers.origin;
  return CLIENT_URLS.includes(origin) ? origin : CLIENT_URLS[0];
};

router.post("/create-checkout-session", async (req, res) => {
  console.log("Received request to create checkout session");
  console.log(req.body);
  const {
    user_id,
    tour_id,
    time_slot_id,
    booking_date,
    adults,
    children,
    infants,
    mainImage,
    price,
    title,
  } = req.body.bookings[0];

  const adultPrice = price * adults;
  const childPrice = price * 0.5 * children;
  const infantPrice = 0 * infants;

  const totalPrice = adultPrice + childPrice + infantPrice;

  console.log(
    "Req body:",
    user_id,
    tour_id,
    time_slot_id,
    booking_date,
    adults,
    children,
    infants,
    mainImage,
    price,
    title
  );

  try {
    const clientUrl = getClientUrl(req);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: title,
              images: [`${clientUrl}/${mainImage}`],
            },
            unit_amount: totalPrice * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${clientUrl}/success`,
      cancel_url: `${clientUrl}/cancel`,
      metadata: {
        user_id,
        tour_id,
        time_slot_id,
        booking_date,
        adults,
        children,
        infants,
      },
    });

    console.log(
      "Price:",
      price,
      "Metadata",
      user_id,
      tour_id,
      booking_date,
      time_slot_id,
      adults,
      children,
      infants,
      "metadata req body",
      req.body
    );
    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
