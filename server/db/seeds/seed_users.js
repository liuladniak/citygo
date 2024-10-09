/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  await knex("users").del();
  await knex("users").insert({
    first_name: "aa",
    last_name: "aa",
    phone: "1231413",
    email: "aa@aa.com",
    address: "123 Main St, Anytown",
    password: "$2a$10$7y7NynftphAp0bEN6QWjOeu3TY0j0H05Uvif8M8fItB2ovH5bfiBW",
    created_at: knex.fn.now(),
    updated_at: knex.fn.now(),
  });
}
