import { Router } from "express";
import { requireClientAuth } from "../../middleware/clientAuth.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./reviews.controller.js";
import { createBody, listQuery, reviewIdParam, tourParam } from "./reviews.schemas.js";

const router = Router();

// Public: shown on the tour page.
router.get("/tour/:tourId", validate({ params: tourParam, query: listQuery }), controller.listForTour);

// Signed-in guests only.
router.post("/", requireClientAuth, validate({ body: createBody }), controller.create);
router.get("/user/eligible", requireClientAuth, controller.eligible);
router.delete("/:id", requireClientAuth, validate({ params: reviewIdParam }), controller.remove);

export default router;
