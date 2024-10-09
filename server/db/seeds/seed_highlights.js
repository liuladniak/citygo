/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export async function seed(knex) {
  await knex("highlights").del();

  await knex("highlights").insert([
    { tour_id: 1, highlight: "Hagia Sophia" },
    { tour_id: 1, highlight: "Blue Mosque" },
    { tour_id: 1, highlight: "Topkapi Palace" },
    { tour_id: 1, highlight: "Grand Bazaar" },

    { tour_id: 2, highlight: "Bosphorus views" },
    { tour_id: 2, highlight: "Spice Market" },
    { tour_id: 2, highlight: "Rustem Pasha Mosque" },

    { tour_id: 3, highlight: "Turkish Delight shop" },
    { tour_id: 3, highlight: "Kebap restaurant" },
    { tour_id: 3, highlight: "Fish market" },
    { tour_id: 3, highlight: "Traditional Tea house" },

    { tour_id: 4, highlight: "Basilica Cistern" },
    { tour_id: 4, highlight: "Gülhane Park" },
    { tour_id: 4, highlight: "Istanbul Archaeological Museums" },

    { tour_id: 5, highlight: "Galata Tower" },
    { tour_id: 5, highlight: "Historic streets" },
    { tour_id: 5, highlight: "Pera Museum" },
    { tour_id: 5, highlight: "Local cafes" },
    { tour_id: 5, highlight: "Cihangir" },

    { tour_id: 6, highlight: "Fener Greek Orthodox Patriarchate" },
    { tour_id: 6, highlight: "Colorful streets of Balat" },
    { tour_id: 6, highlight: "Bulgarian St. Stephen Church" },
    { tour_id: 6, highlight: "Local cafe experience" },

    { tour_id: 7, highlight: "Grand Bazaar" },
    { tour_id: 7, highlight: "Spice Market" },
    { tour_id: 7, highlight: "Istinye Park" },
    { tour_id: 7, highlight: "Nişantaşı" },

    { tour_id: 8, highlight: "Istanbul Modern" },
    { tour_id: 8, highlight: "Pera Museum" },

    { tour_id: 9, highlight: "Galata Tower" },
    { tour_id: 9, highlight: "Bosphorus views" },
    { tour_id: 9, highlight: "Suleymaniye Mosque" },
    { tour_id: 9, highlight: "Balat" },

    { tour_id: 10, highlight: "Pierre Loti Hill" },
    { tour_id: 10, highlight: "Eyup Sultan Mosque" },
    { tour_id: 10, highlight: "Feshane" },
    { tour_id: 10, highlight: "Rahmi M. Koc Museum" },
    { tour_id: 10, highlight: "Miniatürk" },
  ]);
}
