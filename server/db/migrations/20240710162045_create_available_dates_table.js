export function up(knex) {
  return knex.schema.createTable("available_dates", function (table) {
    table.increments("id").primary();
    table.integer("tour_id").notNullable();
    table.foreign("tour_id").references("tours.id").onDelete("CASCADE");
    table.date("date").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
  });
}

export function down(knex) {
  return knex.schema.dropTable("available_dates");
}
