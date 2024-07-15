import express from "express";
import "dotenv/config";

import initKnex from "knex";
import configuration from "../knexfile.js";
const knex = initKnex(configuration["development"]);

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const bookings = await knex.select("*").from("bookings");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
