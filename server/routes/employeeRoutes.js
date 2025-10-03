import express from "express";
import initKnex from "knex";
import knexConfig from "../knexfile.js";
const knex = initKnex(knexConfig[process.env.NODE_ENV || "development"]);
import "dotenv/config";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const employees = await knex("employees").select(
      "id",
      "first_name",
      "last_name",
      "profile_image",
      // "email",
      // "phone",
      "position",
      // "work_email",
      "status"
    );
    res.status(200).json({
      status: "success",
      data: employees,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while fetching employees data.",
    });
  }
});

export default router;
