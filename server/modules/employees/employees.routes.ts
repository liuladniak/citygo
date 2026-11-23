import { Router } from "express";
import { requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./employees.controller.js";
import { availableQuery, byEmailQuery, createBody, deactivateBody, idParams, updateBody } from "./employees.schemas.js";

// Mounted behind requireAuth in index.js. Reading depends on role inside the service.
const router = Router();
const managers = requireRole("admin", "manager");

router.get("/", controller.list);
router.get("/available", validate({ query: availableQuery }), controller.available);
router.get("/by-email", validate({ query: byEmailQuery }), controller.byEmail);
router.get("/availability", controller.teamAvailability);
router.get("/:id", validate({ params: idParams }), controller.get);

router.post("/", managers, validate({ body: createBody }), controller.create);
// Managers change anyone; others only themselves. The service decides.
router.patch("/:id", validate({ params: idParams, body: updateBody }), controller.update);
router.patch("/:id/deactivate", managers, validate({ params: idParams, body: deactivateBody }), controller.deactivate);

export default router;
