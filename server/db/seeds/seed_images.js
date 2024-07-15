/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  await knex("images").del();
  await knex("images").insert([
    { id: 1, tour_id: 1, image_path: "aya-sofia.jpg" },
    { id: 2, tour_id: 1, image_path: "sofia-dom.jpg" },
    { id: 3, tour_id: 1, image_path: "spice-bazaar.jpg" },
    { id: 4, tour_id: 1, image_path: "topkapi.jpg" },

    { id: 5, tour_id: 2, image_path: "bosphorus.jpg" },
    { id: 6, tour_id: 2, image_path: "spice-bazaar.jpg" },
    { id: 7, tour_id: 2, image_path: "ortakoy.jpg" },
    { id: 8, tour_id: 2, image_path: "rustem-pasha.jpg" },

    { id: 9, tour_id: 3, image_path: "baklava.jpg" },
    { id: 10, tour_id: 3, image_path: "breakfast.jpg" },
    { id: 11, tour_id: 3, image_path: "kebab.jpg" },
    { id: 12, tour_id: 3, image_path: "tea.jpg" },

    { id: 13, tour_id: 4, image_path: "basilica.jpg" },
    { id: 14, tour_id: 4, image_path: "gulhane.jpg" },
    { id: 15, tour_id: 4, image_path: "arch-museum.jpg" },
    { id: 16, tour_id: 4, image_path: "mosaic-museum.jpg" },

    { id: 17, tour_id: 5, image_path: "galata.jpg" },
    { id: 18, tour_id: 5, image_path: "cicek.jpg" },
    { id: 19, tour_id: 5, image_path: "pera.jpg" },
    { id: 20, tour_id: 5, image_path: "streets.jpg" },

    { id: 21, tour_id: 6, image_path: "fener-balat.jpg" },
    { id: 22, tour_id: 6, image_path: "fener-greek.jpg" },
    { id: 23, tour_id: 6, image_path: "bulgarian-church.jpg" },
    { id: 24, tour_id: 6, image_path: "balat-cafe.jpg" },

    { id: 25, tour_id: 7, image_path: "grand-bazaar.jpg" },
    { id: 26, tour_id: 7, image_path: "spice-bazaar.jpg" },
    { id: 27, tour_id: 7, image_path: "istiniye.jpg" },
    { id: 28, tour_id: 7, image_path: "nisantasi.jpg" },

    { id: 29, tour_id: 8, image_path: "pera.jpg" },
    { id: 30, tour_id: 8, image_path: "turkish-art.jpg" },
    { id: 31, tour_id: 8, image_path: "akm.jpg" },
    { id: 32, tour_id: 8, image_path: "art-museum.jpg" },

    { id: 33, tour_id: 9, image_path: "photoshoot.jpg" },
    { id: 34, tour_id: 9, image_path: "ortakoy.jpg" },
    { id: 35, tour_id: 9, image_path: "suleymaniye.jpg" },
    { id: 36, tour_id: 9, image_path: "fener-balat.jpg" },

    { id: 37, tour_id: 10, image_path: "pier-loti.jpg" },
    { id: 38, tour_id: 10, image_path: "eyup.jpg" },
    { id: 39, tour_id: 10, image_path: "koc.jpg" },
    { id: 40, tour_id: 10, image_path: "miniaturk.jpg" },
  ]);
}
