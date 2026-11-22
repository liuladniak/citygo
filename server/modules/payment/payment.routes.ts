import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { intent, quote } from "./payment.controller.js";
import { intentBody, paymentLabel, quoteBody } from "./payment.schemas.js";

const router = Router();

router.post("/cart/quote", validate({ body: quoteBody }, { label: paymentLabel }), quote);
router.post("/create-payment-intent", validate({ body: intentBody }, { label: paymentLabel }), intent);

export default router;
