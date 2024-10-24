export function up(knex) {
  return knex.schema.createTable("tours", (table) => {
    table.increments("id").primary();
    table.string("slug").unique().notNullable();
    table.string("tour_name").notNullable();
    table.string("duration").notNullable();
    table.string("category").notNullable();
    table.string("landmarks").notNullable();
    table.decimal("price", 10, 2).notNullable();
    table.string("activity_level").notNullable();
    table.string("overview_title").notNullable();
    table.text("overview").notNullable();
    table.string("essentials").notNullable();
    table.string("includes").notNullable();
    table.string("accessibility").notNullable();
    table.integer("groups").notNullable();
    table.integer("minimum_of_attendees").notNullable();
    table.string("additional_costs").notNullable();
    table.time("start_time").notNullable();
    table.time("end_time").notNullable();
    table.decimal("longitude", 9, 6).notNullable();
    table.decimal("latitude", 9, 6).notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
    // .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
  });
}

export function down(knex) {
  return knex.schema.dropTable("tours");
}
