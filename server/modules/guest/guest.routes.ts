import { Router } from "express";
import { requireClientAuth } from "../../middleware/clientAuth.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./guest.controller.js";
import { bookingsQuery } from "./guest.schemas.js";

// Mounted at /api/client: what a signed-in guest sees about themselves.
const router = Router();

router.get("/bookings", requireClientAuth, validate({ query: bookingsQuery }), controller.bookings);

export default router;
