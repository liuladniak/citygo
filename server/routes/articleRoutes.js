import express from "express";
import initKnex from "knex";
import knexConfig from "../knexfile.js";
import multer from "multer";
import { join } from "path";

const knex = initKnex(knexConfig[process.env.NODE_ENV || "development"]);
import "dotenv/config";
const router = express.Router();

export default function createArticleRoutes(baseDir) {
  const storage = (baseDir) =>
    multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, join(baseDir, "public", "articles"));
      },
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      },
    });

  const upload = multer({ storage: storage(baseDir) });
  const router = express.Router();

  const getAllArticles = async (req, res) => {
    const { page, limit } = req.query;
    const offset = (page - 1) * limit;
    try {
      const totalArticlesResult = await knex("articles")
        .countDistinct("articles.id as count")
        .first();
      const totalArticles = totalArticlesResult.count;

      const articles = await knex("articles")
        .select("articles.*")
        .offset(offset)
        .limit(limit);

      const articleIds = articles.map((article) => article.id);

      const detailedArticles = await knex("articles")
        .select("articles.id", "article_images.image_url", "articles.*")
        .leftJoin("article_images", "articles.id", "article_images.article_id")
        .whereIn("articles.id", articleIds);

      const groupedArticles = detailedArticles.reduce((acc, article) => {
        const { id, image_url, ...articleData } = article;

        if (!acc[id]) {
          acc[id] = {
            ...articleData,
            images: [],
          };
        }

        if (image_url && !acc[id].images.includes(image_url)) {
          acc[id].images.push(image_url);
        }

        return acc;
      }, {});

      const finalResult = Object.values(groupedArticles);

      const totalPages = Math.ceil(totalArticles / limit);
      res.status(200).json({
        data: finalResult,
        currentPage: Number(page),
        totalPages,
        totalArticles,
      });
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  const addArticle = async (req, res) => {
    const { article_title, content, author, category, description } = req.body;
    const images = req.files;

    try {
      const [articleId] = await knex("articles")
        .insert({
          article_title,
          content,
          author,
          category,
          description,
          created_at: knex.fn.now(),
          updated_at: knex.fn.now(),
        })
        .returning("id");

      if (images && images.length) {
        const imageRecords = images.map((file) => ({
          article_id: articleId,
          image_url: file.filename,
        }));
        await knex("article_images").insert(imageRecords);
      }

      res.status(201).json({ message: "Article added successfully!" });
    } catch (error) {
      console.error("Error adding article:", error);
      res.status(500).json({ message: "Failed to add article" });
    }
  };

  const editArticle = async (req, res) => {
    const { articleId } = req.params;
    const { article_title, content, author, category, description } = req.body;
    const images = req.files;

    try {
      await knex("articles").where({ id: articleId }).update({
        article_title,
        content,
        author,
        category,
        description,
        updated_at: knex.fn.now(),
      });

      await knex("article_images").where({ article_id: articleId }).del();
      if (images && images.length) {
        const imageRecords = images.map((file) => ({
          article_id: articleId,
          image_url: file.filename,
        }));
        await knex("article_images").insert(imageRecords);
      }

      res.status(200).json({ message: "Article updated successfully!" });
    } catch (error) {
      console.error("Error updating article:", error);
      res.status(500).json({ message: "Failed to update article" });
    }
  };

  const getArticleBySlug = async (req, res) => {
    const { slug } = req.params;
    try {
      const article = await knex("articles").where({ slug }).first();

      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      const articleImages = await knex("article_images")
        .select("image_url")
        .where({ article_id: article.id });

      const finalResult = {
        ...article,
        images: articleImages.map((image) => image.image_url),
      };

      res.status(200).json(finalResult);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  router.get("/", getAllArticles);
  router.get("/:slug", getArticleBySlug);
  router.post("/", upload.array("images"), addArticle);
  router.put("/:articleId", upload.array("images"), editArticle);

  return router;
}
