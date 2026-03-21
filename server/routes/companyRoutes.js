import express from "express";
import initKnex from "knex";
import knexConfig from "../knexfile.js";

const knex = initKnex(knexConfig[process.env.NODE_ENV || "development"]);
const router = express.Router();

router.get("/settings", async (req, res) => {
  try {
    const settings = await knex("company_settings").first();
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch company settings" });
  }
});

router.patch("/settings", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      city,
      country,
      website,
      timezone,
      currency,
      vat_number,
      invoice_footer,
      logo_url,
    } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (city !== undefined) updates.city = city;
    if (country !== undefined) updates.country = country;
    if (website !== undefined) updates.website = website;
    if (timezone !== undefined) updates.timezone = timezone;
    if (currency !== undefined) updates.currency = currency;
    if (vat_number !== undefined) updates.vat_number = vat_number;
    if (invoice_footer !== undefined) updates.invoice_footer = invoice_footer;
    if (logo_url !== undefined) updates.logo_url = logo_url;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    updates.updated_at = knex.fn.now();
    await knex("company_settings").where("id", 1).update(updates);
    const updated = await knex("company_settings").first();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update company settings" });
  }
});

router.get("/availability", async (req, res) => {
  try {
    const specific = await knex("agency_unavailable_dates").orderBy(
      "unavailable_date"
    );
    const recurring = await knex("agency_recurring_unavailabilities").orderBy(
      "day_of_week"
    );
    res.json({ specific, recurring });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

router.post("/availability/dates", async (req, res) => {
  try {
    const { date, reason } = req.body;
    if (!date) return res.status(400).json({ message: "Date is required" });
    const [record] = await knex("agency_unavailable_dates")
      .insert({ unavailable_date: date, reason: reason || null })
      .returning("*");
    res.status(201).json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add date" });
  }
});

router.delete("/availability/dates/:id", async (req, res) => {
  try {
    await knex("agency_unavailable_dates").where("id", req.params.id).del();
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete" });
  }
});

router.post("/availability/recurring", async (req, res) => {
  try {
    const { day_of_week, reason } = req.body;
    if (day_of_week === undefined)
      return res.status(400).json({ message: "day_of_week required" });
    const existing = await knex("agency_recurring_unavailabilities")
      .where({ day_of_week })
      .first();
    if (existing) return res.status(409).json({ message: "Already blocked" });
    const [record] = await knex("agency_recurring_unavailabilities")
      .insert({ day_of_week, reason: reason || null })
      .returning("*");
    res.status(201).json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add recurring" });
  }
});

router.delete("/availability/recurring/:id", async (req, res) => {
  try {
    await knex("agency_recurring_unavailabilities")
      .where("id", req.params.id)
      .del();
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete" });
  }
});

export default router;
