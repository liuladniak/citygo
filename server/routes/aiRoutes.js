import express from "express";
import { getAiItinerary } from "../services/aiService.js";

const router = express.Router();

router.post("/generate-itinerary", async (req, res, next) => {
  try {
    const { city } = req.body;

    const aiData = await getAiItinerary(city);

    res.json({
      success: true,
      ...aiData,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
