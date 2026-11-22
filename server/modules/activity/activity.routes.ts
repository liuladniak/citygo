import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { feed } from "./activity.controller.js";
import { feedQuery } from "./activity.schemas.js";

// Mounted behind requireAuth in index.js.
const router = Router();

router.get("/", validate({ query: feedQuery }), feed);

export default router;
