import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { bookings } from "../guest/guest.controller.js";
import { bookingsQuery } from "../guest/guest.schemas.js";

// Mounted at /api/bookings after requireAuth and before the staff-only routes.
// The site's account page still calls GET /api/bookings?userId=; it answers from the signed-in
// guest's own bookings. Remove once no live client uses it (the new path is /api/client/bookings).
const router = Router();

router.get("/", (req, _res, next) => {
  // requireAuth sets the Supabase user; the guest controller reads it as userId.
  Object.assign(req, { userId: (req as unknown as { user: { id: string } }).user.id });
  next();
}, validate({ query: bookingsQuery }), bookings);

export default router;
