import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import * as controller from "./tasks.controller.js";
import { bulkBody, commentBody, createBody, idParams, listQuery, previewBody, updateBody } from "./tasks.schemas.js";

// Mounted behind requireAuth in index.js.
const router = Router();

router.get("/", validate({ query: listQuery }), controller.list);

// Registered before "/:id" so "bulk-close" is not read as an id.
router.post("/bulk-close/preview", validate({ body: previewBody }, { label: () => "" }), controller.preview);
router.post("/bulk-close", validate({ body: bulkBody }, { label: () => "" }), controller.bulk);

router.get("/:id", validate({ params: idParams }), controller.get);
router.post("/", validate({ body: createBody }), controller.create);
router.patch("/:id", validate({ params: idParams, body: updateBody }), controller.update);
router.delete("/:id", validate({ params: idParams }), controller.cancel);
router.post("/:id/comments", validate({ params: idParams, body: commentBody }), controller.comment);

export default router;
