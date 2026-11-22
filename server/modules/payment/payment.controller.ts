import { asyncHandler } from "../../lib/asyncHandler.js";
import { createPaymentIntent, quoteCart } from "./payment.service.js";

export const quote = asyncHandler(async (req, res) => {
  res.json(await quoteCart(req.body));
});

export const intent = asyncHandler(async (req, res) => {
  res.json(await createPaymentIntent(req.body));
});
