import express from "express";
import initKnex from "knex";
import knexConfig from "../knexfile.js";
import "dotenv/config";

const knex = initKnex(knexConfig[process.env.NODE_ENV || "development"]);
const router = express.Router();

router.get("/", async (req, res) => {
  const { page = 1, limit = 8, category } = req.query;

  console.log("Searching for category:", category);

  const offset = (page - 1) * limit;

  try {
    let baseQuery = knex("articles")
      .leftJoin("authors", "articles.author_id", "authors.id")
      .select(
        "articles.*",
        "authors.name as author_name",
        "authors.profile_image as author_avatar"
      );

    if (category && category !== "all") {
      baseQuery = baseQuery.where("articles.category", category);
    }

    let countQuery = knex("articles");
    if (category && category !== "all") {
      countQuery = countQuery.where("category", category);
    }

    const totalResult = await countQuery.countDistinct("id as count").first();
    const total = parseInt(totalResult.count);

    const articles = await baseQuery
      .orderBy("articles.date_posted", "desc")
      .offset(offset)
      .limit(limit);

    const articleIds = articles.map((a) => a.id);

    const images = await knex("article_images")
      .whereIn("article_id", articleIds)
      .select("article_id", "image_url", "caption");

    const imagesByArticleId = images.reduce((acc, img) => {
      if (!acc[img.article_id]) acc[img.article_id] = [];
      acc[img.article_id].push({ url: img.image_url, caption: img.caption });
      return acc;
    }, {});

    const result = articles.map((a) => ({
      ...a,
      images: imagesByArticleId[a.id] ?? [],
    }));

    res.json({
      data: result,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const article = await knex("articles")
      .where("articles.slug", req.params.slug)
      .leftJoin("authors", "articles.author_id", "authors.id")
      .select(
        "articles.*",
        "authors.name as author_name",
        "authors.bio as author_bio",
        "authors.profile_image as author_avatar"
      )
      .first();

    if (!article) return res.status(404).json({ message: "Article not found" });

    const images = await knex("article_images")
      .where("article_id", article.id)
      .select("image_url", "caption")
      .orderBy("id");

    const related = await knex("articles")
      .where("category", article.category)
      .whereNot("articles.id", article.id)
      .leftJoin("article_images", "articles.id", "article_images.article_id")
      .select(
        "articles.id",
        "articles.title",
        "articles.slug",
        "articles.category",
        "articles.date_posted",
        "articles.read_time",
        "articles.description",
        "article_images.image_url"
      )
      .limit(3);

    res.json({
      ...article,
      images: images.map((i) => ({ url: i.image_url, caption: i.caption })),
      related,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  const { title, content, author_id, category, description, slug, images } =
    req.body;
  try {
    const [article] = await knex("articles")
      .insert({
        title,
        content,
        author_id,
        category,
        description,
        slug,
        date_posted: knex.fn.now(),
      })
      .returning("*");

    if (images?.length) {
      await knex("article_images").insert(
        images.map((img) => ({
          article_id: article.id,
          image_url: img.url,
          caption: img.caption ?? null,
        }))
      );
    }
    res.status(201).json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create article" });
  }
});

router.put("/:id", async (req, res) => {
  const { title, content, category, description, images } = req.body;
  try {
    await knex("articles").where("id", req.params.id).update({
      title,
      content,
      category,
      description,
      updated_at: knex.fn.now(),
    });

    if (images?.length) {
      await knex("article_images").where("article_id", req.params.id).del();
      await knex("article_images").insert(
        images.map((img) => ({
          article_id: req.params.id,
          image_url: img.url,
          caption: img.caption ?? null,
        }))
      );
    }
    res.json({ message: "Article updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update article" });
  }
});

export default router;
