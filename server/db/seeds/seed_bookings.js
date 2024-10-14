import bookings from "../seed-data/bookings.js";
export async function seed(knex) {
  await knex("bookings").del();
  await knex("bookings").insert(bookings);
}
