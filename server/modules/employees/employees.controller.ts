import type { Request } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import * as service from "./employees.service.js";
import type { CreateBody, UpdateBody } from "./employees.schemas.js";

// requireAuth puts the Supabase user and the role (from user_roles) on the request.
const viewerOf = (req: Request): service.Viewer => {
  const { user, role } = req as Request & { user?: { email?: string | null }; role?: string | null };
  return { role: role ?? null, email: user?.email ?? null };
};

export const list = asyncHandler(async (req, res) => {
  res.json(await service.listEmployees(viewerOf(req)));
});

export const available = asyncHandler(async (req, res) => {
  res.json(await service.listAvailableOn(String(req.query.date)));
});

export const byEmail = asyncHandler(async (req, res) => {
  res.json(await service.findByEmail(String(req.query.email), viewerOf(req)));
});

export const teamAvailability = asyncHandler(async (_req, res) => {
  res.json(await service.getTeamAvailability());
});

export const get = asyncHandler(async (req, res) => {
  res.json(await service.getEmployee(Number(req.params.id), viewerOf(req)));
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await service.createEmployee(req.body as CreateBody));
});

export const update = asyncHandler(async (req, res) => {
  res.json(await service.updateEmployee(Number(req.params.id), req.body as UpdateBody, viewerOf(req)));
});

export const deactivate = asyncHandler(async (req, res) => {
  res.json(await service.deactivateEmployee(Number(req.params.id), (req.body as { reason: string }).reason));
});
