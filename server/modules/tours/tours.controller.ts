import type { Request } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import * as service from "./tours.service.js";
import type { CreateBody, ListQuery, Slot, Stop, UpdateBody } from "./tours.schemas.js";

// optionalAuth / requireAuth put the Supabase user and the role (from user_roles) on the request.
const viewerOf = (req: Request): service.Viewer => {
  const { user, role } = req as Request & { user?: { email?: string | null }; role?: string | null };
  return { staff: Boolean(role), email: user?.email ?? null };
};
const slugOf = (req: Request) => String(req.params.slug);
const idOf = (req: Request) => Number(req.params.id);

export const list = asyncHandler(async (req, res) => {
  res.json(await service.listTours(req.query as unknown as ListQuery, viewerOf(req)));
});
export const simple = asyncHandler(async (req, res) => {
  res.json(await service.listSimple(viewerOf(req)));
});
export const timeSlots = asyncHandler(async (req, res) => {
  res.json(await service.listTimeSlots(viewerOf(req)));
});
export const specific = asyncHandler(async (req, res) => {
  res.json(await service.getToursByIds((req.query as unknown as { ids: number[] }).ids, viewerOf(req)));
});
export const get = asyncHandler(async (req, res) => {
  res.json(await service.getTourBySlug(slugOf(req), viewerOf(req)));
});
export const activity = asyncHandler(async (req, res) => {
  res.json(await service.getActivity(slugOf(req)));
});
export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await service.createTour(req.body as CreateBody, viewerOf(req)));
});
export const update = asyncHandler(async (req, res) => {
  res.json(await service.updateTour(slugOf(req), req.body as UpdateBody, viewerOf(req)));
});
export const images = asyncHandler(async (req, res) => {
  res.json(await service.replaceImages(slugOf(req), (req.body as { images: string[] }).images, viewerOf(req)));
});
export const highlights = asyncHandler(async (req, res) => {
  res.json(await service.replaceHighlights(slugOf(req), (req.body as { highlights: string[] }).highlights, viewerOf(req)));
});
export const itinerary = asyncHandler(async (req, res) => {
  res.json(await service.replaceItinerary(slugOf(req), (req.body as { itinerary: Stop[] }).itinerary, viewerOf(req)));
});
export const slots = asyncHandler(async (req, res) => {
  res.json(await service.syncTimeSlots(slugOf(req), (req.body as { time_slots: Slot[] }).time_slots, viewerOf(req)));
});
export const blockedDays = asyncHandler(async (req, res) => {
  res.json(await service.getBlockedDays(slugOf(req), viewerOf(req)));
});
export const blockDate = asyncHandler(async (req, res) => {
  const { date, reason } = req.body as { date: string; reason?: string };
  res.status(201).json(await service.blockDate(slugOf(req), date, reason));
});
export const unblockDate = asyncHandler(async (req, res) => {
  await service.unblockDate(slugOf(req), idOf(req));
  res.json({ message: "Deleted" });
});
export const blockWeekday = asyncHandler(async (req, res) => {
  const { day_of_week, reason } = req.body as { day_of_week: number; reason?: string };
  res.status(201).json(await service.blockWeekday(slugOf(req), day_of_week, reason));
});
export const unblockWeekday = asyncHandler(async (req, res) => {
  await service.unblockWeekday(slugOf(req), idOf(req));
  res.json({ message: "Deleted" });
});
