import express from "express";
import initKnex from "knex";
import knexConfig from "../knexfile.js";
import { getAiItinerary } from "../services/aiService.js";
import axios from "axios";
import { redact } from "../lib/redact.js";
import { checkAiCaps } from "../lib/aiCaps.js";
import { getRedis } from "../lib/redis.js";

const knex = initKnex(knexConfig[process.env.NODE_ENV || "development"]);
const router = express.Router();

const getTourContext = async (message) => {
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

    const msg = message.toLowerCase();

    // keyword matching — score each tour by relevance
    const scored = tours.map((t) => {
      let score = 0;
      const text = `${t.tour_name} ${t.overview} ${t.category}`.toLowerCase();

      // category keywords
      if (
        msg.includes("food") ||
        msg.includes("culinary") ||
        msg.includes("eat")
      ) {
        if (t.category === "Culinary tour") score += 3;
      }
      if (
        msg.includes("history") ||
        msg.includes("historical") ||
        msg.includes("ottoman") ||
        msg.includes("byzantine")
      ) {
        if (t.category === "Guided tour") score += 3;
      }
      if (
        msg.includes("experience") ||
        msg.includes("activity") ||
        msg.includes("adventure")
      ) {
        if (t.category === "Experience") score += 3;
      }

      // location/landmark keywords
      const landmarks = [
        "galata",
        "bosphorus",
        "hagia",
        "sophia",
        "topkapi",
        "bazaar",
        "spice",
        "balat",
        "kadikoy",
        "sultanahmet",
        "beyoglu",
      ];
      landmarks.forEach((l) => {
        if (msg.includes(l) && text.includes(l)) score += 2;
      });

      // general travel intent
      if (
        msg.includes("romantic") ||
        msg.includes("water") ||
        msg.includes("cruise")
      ) {
        if (text.includes("bosphorus") || text.includes("cruise")) score += 2;
      }

      // always include featured/bestseller tours as baseline
      if (t.featured) score += 1;

      return { tour: t, score };
    });

    // sort by score, take top 5
    const relevant = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ tour: t }) => {
        const rating = t.avg_rating
          ? ` | ★${t.avg_rating} (${t.review_count} reviews)`
          : "";
        return [
          `Tour: ${t.tour_name}`,
          `Duration: ${t.duration}`,
          `Price: From $${t.price} per person`,
          `Category: ${t.category}`,
          `Overview: ${t.overview?.slice(0, 150) || ""}`,
          `Rating${rating}`,
          `URL: /tours/${t.slug}`,
        ].join(" | ");
      })
      .join("\n");

    return relevant;
  } catch (err) {
    console.error("Failed to fetch tour context:", err.message);
    return "";
  }
};
// const tourContext = await getTourContext(message.trim());
// Milo's AI fallback. Reached only when the widget found no local answer.
// Single question, no history. Switched on with AI_ENABLED=true and capped per
// IP and per day (see lib/aiCaps.ts). Every failure returns a plain error so the
// widget can show its normal "not sure" reply.
router.post("/chat", async (req, res) => {
  if (process.env.AI_ENABLED !== "true") {
    return res.status(503).json({ error: "unavailable" });
  }

  const { message } = req.body ?? {};
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Invalid message." });
  }
  if (message.length > 500) {
    return res
      .status(400)
      .json({ error: "Message too long. Keep it under 500 characters." });
  }
  // Gemini's free tier may use content to improve Google products: send nothing personal.
  const clean = redact(message);
  if (!clean) {
    return res.status(400).json({ error: "Message cannot be empty." });
  }

  const caps = await checkAiCaps(getRedis(), req.ip);
  if (!caps.allowed) {
    return res
      .status(caps.reason === "error" ? 503 : 429)
      .json({ error: caps.reason === "error" ? "unavailable" : "limit" });
  }

  try {
    const tourContext = await getTourContext(clean);
    const response = await axios.post(
      `${process.env.AI_SERVICE_URL}/ai/chat`,
      { message: clean, tour_context: tourContext },
      { timeout: 15000 },
    );
    if (!response.data?.reply) {
      return res.status(503).json({ error: "unavailable" });
    }
    res.json({ reply: response.data.reply });
  } catch (err) {
    console.error("Milo chat error:", err.message);
    res.status(503).json({ error: "unavailable" });
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
