import highlights from "../seed-data/highlights.js";

export async function seed(knex) {
  await knex("highlights").del();
  await knex("highlights").insert(highlights);
}
