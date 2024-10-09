/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  await knex("bookings").del();
  await knex("bookings").insert([
    {
      user_id: 1,
      tour_id: 1,
      number_of_people: 2,
      booking_date: "2024-07-02",
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      user_id: 1,
      tour_id: 1,
      number_of_people: 3,
      booking_date: "2024-07-25",
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
  ]);
}
