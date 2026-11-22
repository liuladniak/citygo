import { Router } from "express";
import { requireClientAuth } from "../../middleware/clientAuth.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./profile.controller.js";
import { updateBody } from "./profile.schemas.js";

// Mounted at /auth, which is where the site has always called it.
const router = Router();

router.get("/profile", requireClientAuth, controller.get);
router.put("/profile", requireClientAuth, validate({ body: updateBody }), controller.update);

export default router;
