import dates from "../seed-data/available_dates.js";

export async function seed(knex) {
  await knex("available_dates").del();
  await knex("available_dates").insert(dates);
}
