import express from "express";
import "dotenv/config";

import initKnex from "knex";
import configuration from "../knexfile.js";
const knex = initKnex(configuration["development"]);

const router = express.Router();

router.get("/users", async (req, res) => {
  try {
    const users = await db.select("*").from("users");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
export default router;
