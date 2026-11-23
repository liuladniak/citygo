import type { Request } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import * as service from "./tasks.service.js";
import type { BulkBody, CreateBody, ListQuery, UpdateBody } from "./tasks.schemas.js";

// requireAuth puts the Supabase user and the role (from user_roles) on the request.
const viewerOf = (req: Request): service.Viewer => {
  const { user, role } = req as Request & { user?: { email?: string | null }; role?: string | null };
  return { role: role ?? null, email: user?.email ?? null };
};

export const list = asyncHandler(async (req, res) => {
  res.json(await service.listTasks(req.query as unknown as ListQuery));
});

export const get = asyncHandler(async (req, res) => {
  res.json(await service.getTask(Number(req.params.id)));
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await service.createTask(req.body as CreateBody, viewerOf(req)));
});

export const update = asyncHandler(async (req, res) => {
  res.json(await service.updateTask(Number(req.params.id), req.body as UpdateBody, viewerOf(req)));
});

export const cancel = asyncHandler(async (req, res) => {
  await service.cancelTask(Number(req.params.id));
  res.json({ success: true });
});

export const comment = asyncHandler(async (req, res) => {
  res.status(201).json(await service.addComment(Number(req.params.id), (req.body as { content: string }).content, viewerOf(req)));
});

export const preview = asyncHandler(async (req, res) => {
  res.json(await service.previewClose((req.body as { ids: number[] }).ids));
});

export const bulk = asyncHandler(async (req, res) => {
  res.json(await service.bulkClose(req.body as BulkBody, viewerOf(req)));
});
