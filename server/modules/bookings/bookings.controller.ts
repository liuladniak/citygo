import type { Request } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import * as service from "./bookings.service.js";
import type { AnalyticsQuery, GuestsQuery, ListQuery } from "./bookings.schemas.js";

const idOf = (req: Request) => Number(req.params.id);

export const list = asyncHandler(async (req, res) => {
  res.json(await service.listBookings(req.query as unknown as ListQuery));
});
export const dashboardStats = asyncHandler(async (_req, res) => {
  res.json(await service.dashboardStats());
});
export const analytics = asyncHandler(async (req, res) => {
  res.json(await service.analytics(req.query as unknown as AnalyticsQuery));
});
export const guests = asyncHandler(async (req, res) => {
  res.json(await service.listGuests(req.query as unknown as GuestsQuery));
});
export const detail = asyncHandler(async (req, res) => {
  res.json(await service.getBookingDetail(idOf(req)));
});
export const assignments = asyncHandler(async (req, res) => {
  res.json(await service.listAssignments(idOf(req)));
});
export const voucher = asyncHandler(async (req, res) => {
  res.json(await service.getVoucher(idOf(req)));
});
