import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { send } from "./contact.controller.js";
import { contactBody } from "./contact.schemas.js";

const router = Router();

// The first problem's message is what the form shows, so no field-name prefix.
router.post("/", validate({ body: contactBody }, { label: () => "" }), send);

export default router;
