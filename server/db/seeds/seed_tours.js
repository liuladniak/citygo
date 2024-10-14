import tours from "../seed-data/tours.js";

export async function seed(knex) {
  await knex("tours").del();
  await knex("tours").insert(tours);
}
