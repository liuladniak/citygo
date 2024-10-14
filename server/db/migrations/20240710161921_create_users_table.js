export function up(knex) {
  return knex.schema.createTable("users", (table) => {
    // table.increments("id").unsigned().primary();
    table.increments("id").primary();
    table.string("first_name", 255).notNullable();
    table.string("last_name", 255).notNullable();
    table.string("phone", 255).notNullable();
    table.string("email", 255).notNullable().unique();
    table.string("address", 255).notNullable();
    table.string("password", 255).notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.dropTable("users");
}
