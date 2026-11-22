import { asyncHandler } from "../../lib/asyncHandler.js";
import * as service from "./company.service.js";
import type { BlockedDateBody, BlockedWeekdayBody, SettingsBody } from "./company.schemas.js";

export const getSettings = asyncHandler(async (_req, res) => {
  res.json(await service.getSettings());
});

export const updateSettings = asyncHandler(async (req, res) => {
  res.json(await service.updateSettings(req.body as SettingsBody));
});

export const getAvailability = asyncHandler(async (_req, res) => {
  res.json(await service.getAvailability());
});

export const blockDate = asyncHandler(async (req, res) => {
  res.status(201).json(await service.blockDate(req.body as BlockedDateBody));
});

export const unblockDate = asyncHandler(async (req, res) => {
  await service.unblockDate(Number(req.params.id));
  res.json({ message: "Deleted" });
});

export const blockWeekday = asyncHandler(async (req, res) => {
  res.status(201).json(await service.blockWeekday(req.body as BlockedWeekdayBody));
});

export const unblockWeekday = asyncHandler(async (req, res) => {
  await service.unblockWeekday(Number(req.params.id));
  res.json({ message: "Deleted" });
});
