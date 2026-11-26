import { Router } from "express";
import { optionalAuth, requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./tours.controller.js";
import {
  blockedDateBody, blockedWeekdayBody, createBody, highlightsBody, idsQuery, imagesBody, itineraryBody, listQuery,
  slugIdParams, slugParam, timeSlotsBody, updateBody,
} from "./tours.schemas.js";

const router = Router();
const managers = [requireAuth, requireRole("admin", "manager")];

// Public: the site's tour pages. Signed-in staff also see drafts.
router.get("/", optionalAuth, validate({ query: listQuery }), controller.list);
router.get("/simple", optionalAuth, controller.simple);
router.get("/time-slots", optionalAuth, controller.timeSlots);
router.get("/specific-tours", optionalAuth, validate({ query: idsQuery }), controller.specific);
router.get("/:slug", optionalAuth, validate({ params: slugParam }), controller.get);
router.get("/:slug/unavailable-dates", optionalAuth, validate({ params: slugParam }), controller.blockedDays);

// Staff: the edit history shows who changed what.
router.get("/:slug/activity", requireAuth, validate({ params: slugParam }), controller.activity);

router.post("/", ...managers, validate({ body: createBody }), controller.create);
router.patch("/:slug", ...managers, validate({ params: slugParam, body: updateBody }), controller.update);
router.put("/:slug/images", ...managers, validate({ params: slugParam, body: imagesBody }), controller.images);
router.put("/:slug/highlights", ...managers, validate({ params: slugParam, body: highlightsBody }), controller.highlights);
router.put("/:slug/time-slots", ...managers, validate({ params: slugParam, body: timeSlotsBody }), controller.slots);
router.put("/:slug/itinerary", ...managers, validate({ params: slugParam, body: itineraryBody }), controller.itinerary);

router.post("/:slug/unavailable-dates", ...managers, validate({ params: slugParam, body: blockedDateBody }), controller.blockDate);
router.delete("/:slug/unavailable-dates/:id", ...managers, validate({ params: slugIdParams }), controller.unblockDate);
router.post("/:slug/recurring-unavailabilities", ...managers, validate({ params: slugParam, body: blockedWeekdayBody }), controller.blockWeekday);
router.delete("/:slug/recurring-unavailabilities/:id", ...managers, validate({ params: slugIdParams }), controller.unblockWeekday);

export default router;
