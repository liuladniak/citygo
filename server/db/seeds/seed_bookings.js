/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  await knex("bookings").del();
  await knex("bookings").insert([
    {
      id: 1,
      user_id: 12,
      tour_id: 1,
      number_of_people: 2,
      booking_date: "2024-07-02",
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
  ]);
}
