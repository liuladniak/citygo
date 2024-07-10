/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  await knex("images").del();
  await knex("images").insert([
    { id: 1, tour_id: 1, image_path: "Image1.jpg" },
    { id: 2, tour_id: 1, image_path: "Image2.jpg" },
    { id: 3, tour_id: 1, image_path: "Image3.jpg" },
    { id: 4, tour_id: 1, image_path: "Image4.jpg" },
    { id: 5, tour_id: 2, image_path: "Image5.jpg" },
    { id: 6, tour_id: 2, image_path: "Image6.jpg" },
    { id: 7, tour_id: 2, image_path: "Image7.jpg" },
    { id: 8, tour_id: 2, image_path: "Image8.jpg" },
    { id: 9, tour_id: 3, image_path: "Image9.jpg" },
    { id: 10, tour_id: 3, image_path: "Image10.jpg" },
    { id: 11, tour_id: 3, image_path: "Image11.jpg" },
    { id: 12, tour_id: 3, image_path: "Image12.jpg" },
    { id: 13, tour_id: 4, image_path: "Image13.jpg" },
    { id: 14, tour_id: 4, image_path: "Image14.jpg" },
    { id: 15, tour_id: 4, image_path: "Image15.jpg" },
    { id: 16, tour_id: 4, image_path: "Image16.jpg" },
    { id: 17, tour_id: 5, image_path: "Image17.jpg" },
    { id: 18, tour_id: 5, image_path: "Image18.jpg" },
    { id: 19, tour_id: 5, image_path: "Image19.jpg" },
    { id: 20, tour_id: 5, image_path: "Image20.jpg" },
    { id: 21, tour_id: 6, image_path: "Image21.jpg" },
    { id: 22, tour_id: 6, image_path: "Image22.jpg" },
    { id: 23, tour_id: 6, image_path: "Image23.jpg" },
    { id: 24, tour_id: 6, image_path: "Image24.jpg" },
    { id: 25, tour_id: 7, image_path: "Image25.jpg" },
    { id: 26, tour_id: 7, image_path: "Image26.jpg" },
    { id: 27, tour_id: 7, image_path: "Image27.jpg" },
    { id: 28, tour_id: 7, image_path: "Image28.jpg" },
    { id: 29, tour_id: 8, image_path: "Image29.jpg" },
    { id: 30, tour_id: 8, image_path: "Image30.jpg" },
    { id: 31, tour_id: 8, image_path: "Image31.jpg" },
    { id: 32, tour_id: 8, image_path: "Image32.jpg" },
    { id: 33, tour_id: 9, image_path: "Image33.jpg" },
    { id: 34, tour_id: 9, image_path: "Image34.jpg" },
    { id: 35, tour_id: 9, image_path: "Image35.jpg" },
    { id: 36, tour_id: 9, image_path: "Image36.jpg" },
    { id: 37, tour_id: 10, image_path: "Image37.jpg" },
    { id: 38, tour_id: 10, image_path: "Image38.jpg" },
    { id: 39, tour_id: 10, image_path: "Image39.jpg" },
    { id: 40, tour_id: 10, image_path: "Image40.jpg" },
  ]);
}
