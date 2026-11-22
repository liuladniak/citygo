import { asyncHandler } from "../../lib/asyncHandler.js";
import { getActivityFeed } from "./activity.service.js";
import type { FeedQuery } from "./activity.schemas.js";

export const feed = asyncHandler(async (req, res) => {
  res.json(await getActivityFeed(req.query as unknown as FeedQuery));
});
