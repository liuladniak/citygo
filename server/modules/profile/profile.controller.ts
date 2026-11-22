import type { Request } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import * as service from "./profile.service.js";
import type { SignedInUser } from "./profile.service.js";
import type { UpdateBody } from "./profile.schemas.js";

// requireClientAuth puts the Supabase user on the request.
const signedIn = (req: Request) => (req as Request & { authUser: SignedInUser }).authUser;

export const get = asyncHandler(async (req, res) => {
  res.json(await service.getOrCreateProfile(signedIn(req)));
});

export const update = asyncHandler(async (req, res) => {
  await service.updateProfile(signedIn(req).id, req.body as UpdateBody);
  res.json({ message: "User profile updated successfully" });
});
