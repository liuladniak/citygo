import type { Request } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import * as service from "./guest.service.js";
import type { BookingsQuery } from "./guest.schemas.js";

export const bookings = asyncHandler(async (req, res) => {
  const supabaseId = (req as Request & { userId: string }).userId;
  const { userId } = req.query as unknown as BookingsQuery;
  res.json(await service.listGuestBookings(supabaseId, userId));
});
