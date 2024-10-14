import images from "../seed-data/images.js";

export async function seed(knex) {
  await knex("images").del();
  await knex("images").insert(images);
}
