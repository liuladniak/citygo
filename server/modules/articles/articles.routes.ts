import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./articles.controller.js";
import { articleIdParam, createBody, listQuery, slugParam, updateBody } from "./articles.schemas.js";

const router = Router();
const staff = [requireAuth, requireRole("admin", "manager")];

// Public: the travel guide on the site.
router.get("/", validate({ query: listQuery }), controller.list);
router.get("/:slug", validate({ params: slugParam }), controller.getBySlug);

// Staff only. These used to be open to anyone.
router.post("/", ...staff, validate({ body: createBody }), controller.create);
router.put("/:id", ...staff, validate({ params: articleIdParam, body: updateBody }), controller.update);

export default router;
