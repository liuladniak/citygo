import express from "express";
import initKnex from "knex";
import knexConfig from "../knexfile.js";
import { getAiItinerary } from "../services/aiService.js";
import axios from "axios";

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
    const tourContext = await getTourContext(message.trim());
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
