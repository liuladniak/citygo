import { Router } from "express";
import { requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { idParam } from "../../lib/schemas.js";
import { bookings as guestBookings } from "../guest/guest.controller.js";
import { bookingsQuery } from "../guest/guest.schemas.js";
import * as controller from "./bookings.controller.js";
import { analyticsQuery, guestsQuery, listQuery } from "./bookings.schemas.js";

/**
 * Mounted at /api/bookings after requireAuth and before the staff gate.
 * The site's account page still calls GET /api/bookings?userId=; it answers from the signed-in
 * guest's own bookings. Remove once no live client uses it (the new path is /api/client/bookings).
 */
export const guestBookingRoutes = Router();
guestBookingRoutes.get(
  "/",
  (req, _res, next) => {
    Object.assign(req, { userId: (req as unknown as { user: { id: string } }).user.id });
    next();
  },
  validate({ query: bookingsQuery }),
  guestBookings,
);

/** Staff only: the caller mounts requireStaff in front. Static paths come before /:id. */
const router = Router();
const managers = requireRole("admin", "manager");

router.get("/all", validate({ query: listQuery }), controller.list);
router.get("/stats/dashboard", controller.dashboardStats);
router.get("/stats/analytics", managers, validate({ query: analyticsQuery }), controller.analytics);
router.get("/guests", managers, validate({ query: guestsQuery }), controller.guests);
router.get("/:id/assignments", validate({ params: idParam }), controller.assignments);
router.get("/:id/voucher", validate({ params: idParam }), controller.voucher);
router.get("/:id", validate({ params: idParam }), controller.detail);

export default router;
