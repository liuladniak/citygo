import { asyncHandler } from "../../lib/asyncHandler.js";
import * as service from "./articles.service.js";
import type { CreateBody, ListQuery, UpdateBody } from "./articles.schemas.js";

export const list = asyncHandler(async (req, res) => {
  res.json(await service.listArticles(req.query as unknown as ListQuery));
});

export const getBySlug = asyncHandler(async (req, res) => {
  res.json(await service.getArticleBySlug(String(req.params.slug)));
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await service.createArticle(req.body as CreateBody));
});

export const update = asyncHandler(async (req, res) => {
  await service.updateArticle(Number(req.params.id), req.body as UpdateBody);
  res.json({ message: "Article updated" });
});
