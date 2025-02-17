export function up(knex) {
  return knex.schema.createTable("bookings", (table) => {
    table.increments("id").primary();
    table.integer("user_id").notNullable();
    table.foreign("user_id").references("users.id").onDelete("CASCADE");
    table.integer("tour_id").notNullable();
    table.foreign("tour_id").references("tours.id").onDelete("CASCADE");
    table.integer("number_of_people").notNullable();
    table.date("booking_date").notNullable();
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable("bookings");
}
