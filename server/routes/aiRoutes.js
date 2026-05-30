import express from "express";
import initKnex from "knex";
import knexConfig from "../knexfile.js";
import { getAiItinerary } from "../services/aiService.js";
import axios from "axios";

const knex = initKnex(knexConfig[process.env.NODE_ENV || "development"]);
const router = express.Router();

const getTourContext = async () => {
  try {
    const tours = await knex("tours")
      .leftJoin("tour_rating_summary as trs", "tours.id", "trs.tour_id")
      .select(
        "tours.tour_name",
        "tours.price",
        "tours.duration",
        "tours.category",
        "tours.overview",
        "tours.slug",
        "trs.avg_rating",
        "trs.review_count",
      )
      .where("tours.status", "!=", "draft")
      .orderBy("tours.id");

    return tours
      .map((t) => {
        const rating = t.avg_rating
          ? ` | ★${t.avg_rating} (${t.review_count} reviews)`
          : "";
        return [
          `Tour: ${t.tour_name}`,
          `Duration: ${t.duration}`,
          `Price: From $${t.price} per person`,
          `Category: ${t.category}`,
          `Overview: ${t.overview || ""}`,
          `Rating${rating}`,
          `URL: /tours/${t.slug}`,
        ].join(" | ");
      })
      .join("\n");
  } catch (err) {
    console.error("Failed to fetch tour context:", err.message);
    return "";
  }
};
const tourContext = await getTourContext();

router.post("/chat", async (req, res) => {
  const { message, history } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Invalid message." });
  }
  if (message.trim().length === 0) {
    return res.status(400).json({ error: "Message cannot be empty." });
  }
  if (message.length > 500) {
    return res
      .status(400)
      .json({ error: "Message too long. Keep it under 500 characters." });
  }

  if (history && !Array.isArray(history)) {
    return res.status(400).json({ error: "Invalid history format." });
  }

  const safeHistory = Array.isArray(history)
    ? history
        .slice(-20)
        .filter(
          (m) =>
            m &&
            typeof m.role === "string" &&
            typeof m.content === "string" &&
            ["user", "model"].includes(m.role) &&
            m.content.length <= 1000,
        )
    : [];

  try {
    const tourContext = await getTourContext();
    console.log("Tour context being sent:\n", tourContext.slice(0, 500));
    const response = await axios.post(`${process.env.AI_SERVICE_URL}/ai/chat`, {
      message: message.trim(),
      history: safeHistory,
      tour_context: tourContext,
    });

    res.json(response.data);
  } catch (err) {
    console.error("Milo chat error:", err.message);
    res.status(503).json({ error: "AI service unavailable." });
  }
});

router.post("/generate-itinerary", async (req, res, next) => {
  try {
    const { city } = req.body;
    const aiData = await getAiItinerary(city);
    res.json({ success: true, ...aiData });
  } catch (error) {
    next(error);
  }
});

export default router;
