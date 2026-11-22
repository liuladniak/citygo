import { Router } from "express";
import { requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./company.controller.js";
import { blockedDateBody, blockedWeekdayBody, recordIdParam, settingsBody } from "./company.schemas.js";

// Mounted behind requireAuth in index.js. Everyone signed in may read; only managers change things.
const router = Router();
const managers = requireRole("admin", "manager");

router.get("/settings", controller.getSettings);
router.patch("/settings", managers, validate({ body: settingsBody }), controller.updateSettings);

router.get("/availability", controller.getAvailability);
router.post("/availability/dates", managers, validate({ body: blockedDateBody }), controller.blockDate);
router.delete("/availability/dates/:id", managers, validate({ params: recordIdParam }), controller.unblockDate);
router.post("/availability/recurring", managers, validate({ body: blockedWeekdayBody }), controller.blockWeekday);
router.delete("/availability/recurring/:id", managers, validate({ params: recordIdParam }), controller.unblockWeekday);

export default router;
