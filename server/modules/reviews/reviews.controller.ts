import type { Request } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { requireInternalUserId } from "../../lib/currentUser.js";
import * as service from "./reviews.service.js";
import type { CreateBody, ListQuery } from "./reviews.schemas.js";

// requireClientAuth puts the Supabase id on the request.
const signedInUser = (req: Request) => requireInternalUserId((req as Request & { userId?: string }).userId);

export const listForTour = asyncHandler(async (req, res) => {
  res.json(await service.listTourReviews(Number(req.params.tourId), req.query as unknown as ListQuery));
});

export const create = asyncHandler(async (req, res) => {
  const userId = await signedInUser(req);
  res.status(201).json(await service.createReview(userId, req.body as CreateBody));
});

export const eligible = asyncHandler(async (req, res) => {
  res.json(await service.listEligibleBookings(await signedInUser(req)));
});

export const remove = asyncHandler(async (req, res) => {
  await service.deleteOwnReview(await signedInUser(req), Number(req.params.id));
  res.json({ message: "Review deleted" });
});
