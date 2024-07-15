/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export async function seed(knex) {
  await knex("highlights").del();

  await knex("highlights").insert([
    { id: 1, tour_id: 1, highlight: "Hagia Sophia" },
    { id: 2, tour_id: 1, highlight: "Blue Mosque" },
    { id: 3, tour_id: 1, highlight: "Topkapi Palace" },
    { id: 4, tour_id: 1, highlight: "Grand Bazaar" },

    { id: 5, tour_id: 2, highlight: "Bosphorus views" },
    { id: 6, tour_id: 2, highlight: "Spice Market" },
    { id: 7, tour_id: 2, highlight: "Rustem Pasha Mosque" },

    { id: 8, tour_id: 3, highlight: "Turkish Delight shop" },
    { id: 9, tour_id: 3, highlight: "Kebap restaurant" },
    { id: 10, tour_id: 3, highlight: "Fish market" },
    { id: 11, tour_id: 3, highlight: "Traditional Tea house" },

    { id: 12, tour_id: 4, highlight: "Basilica Cistern" },
    { id: 13, tour_id: 4, highlight: "Gülhane Park" },
    { id: 14, tour_id: 4, highlight: "Istanbul Archaeological Museums" },

    { id: 15, tour_id: 5, highlight: "Galata Tower" },
    { id: 16, tour_id: 5, highlight: "Historic streets" },
    { id: 17, tour_id: 5, highlight: "Pera Museum" },
    { id: 18, tour_id: 5, highlight: "Local cafes" },
    { id: 19, tour_id: 5, highlight: "Cihangir" },

    { id: 20, tour_id: 6, highlight: "Fener Greek Orthodox Patriarchate" },
    { id: 21, tour_id: 6, highlight: "Colorful streets of Balat" },
    { id: 22, tour_id: 6, highlight: "Bulgarian St. Stephen Church" },
    { id: 23, tour_id: 6, highlight: "Local cafe experience" },

    { id: 24, tour_id: 7, highlight: "Grand Bazaar" },
    { id: 25, tour_id: 7, highlight: "Spice Market" },
    { id: 26, tour_id: 7, highlight: "Istinye Park" },
    { id: 27, tour_id: 7, highlight: "Nişantaşı" },

    { id: 28, tour_id: 8, highlight: "Istanbul Modern" },
    { id: 29, tour_id: 8, highlight: "Pera Museum" },

    { id: 30, tour_id: 9, highlight: "Galata Tower" },
    { id: 31, tour_id: 9, highlight: "Bosphorus views" },
    { id: 32, tour_id: 9, highlight: "Suleymaniye Mosque" },
    { id: 33, tour_id: 9, highlight: "Balat" },

    { id: 34, tour_id: 10, highlight: "Pierre Loti Hill" },
    { id: 35, tour_id: 10, highlight: "Eyup Sultan Mosque" },
    { id: 36, tour_id: 10, highlight: "Feshane" },
    { id: 37, tour_id: 10, highlight: "Rahmi M. Koc Museum" },
    { id: 38, tour_id: 10, highlight: "Miniatürk" },
  ]);
}
