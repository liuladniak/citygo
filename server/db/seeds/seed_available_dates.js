/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export async function seed(knex) {
  await knex("available_dates").del();

  await knex("available_dates").insert([
    { tour_id: 1, date: "2024-09-02" },
    { tour_id: 1, date: "2024-09-03" },
    { tour_id: 1, date: "2024-09-05" },
    { tour_id: 1, date: "2024-09-09" },
    { tour_id: 1, date: "2024-09-10" },
    { tour_id: 1, date: "2024-09-12" },
    { tour_id: 1, date: "2024-09-14" },
    { tour_id: 1, date: "2024-09-16" },
    { tour_id: 1, date: "2024-09-18" },
    { tour_id: 1, date: "2024-09-20" },
    { tour_id: 1, date: "2024-09-23" },
    { tour_id: 1, date: "2024-09-25" },
    { tour_id: 1, date: "2024-09-27" },
    { tour_id: 1, date: "2024-09-29" },

    { tour_id: 2, date: "2024-09-06" },
    { tour_id: 2, date: "2024-09-09" },
    { tour_id: 2, date: "2024-09-13" },
    { tour_id: 2, date: "2024-09-14" },
    { tour_id: 2, date: "2024-09-20" },
    { tour_id: 2, date: "2024-09-21" },
    { tour_id: 2, date: "2024-09-27" },
    { tour_id: 2, date: "2024-09-28" },

    { tour_id: 3, date: "2024-09-01" },
    { tour_id: 3, date: "2024-09-03" },
    { tour_id: 3, date: "2024-09-05" },
    { tour_id: 3, date: "2024-09-09" },
    { tour_id: 3, date: "2024-09-10" },
    { tour_id: 3, date: "2024-09-11" },
    { tour_id: 3, date: "2024-09-13" },
    { tour_id: 3, date: "2024-09-15" },
    { tour_id: 3, date: "2024-09-17" },
    { tour_id: 3, date: "2024-09-19" },
    { tour_id: 3, date: "2024-09-21" },
    { tour_id: 3, date: "2024-09-23" },
    { tour_id: 3, date: "2024-09-25" },
    { tour_id: 3, date: "2024-09-27" },
    { tour_id: 3, date: "2024-09-29" },
    { tour_id: 3, date: "2024-09-20" },

    { tour_id: 4, date: "2024-09-01" },
    { tour_id: 4, date: "2024-09-03" },
    { tour_id: 4, date: "2024-09-05" },
    { tour_id: 4, date: "2024-09-09" },
    { tour_id: 4, date: "2024-09-10" },
    { tour_id: 4, date: "2024-09-12" },
    { tour_id: 4, date: "2024-09-14" },
    { tour_id: 4, date: "2024-09-16" },
    { tour_id: 4, date: "2024-09-18" },
    { tour_id: 4, date: "2024-09-20" },
    { tour_id: 4, date: "2024-09-22" },
    { tour_id: 4, date: "2024-09-24" },
    { tour_id: 4, date: "2024-09-26" },
    { tour_id: 4, date: "2024-09-28" },
    { tour_id: 4, date: "2024-09-30" },

    { tour_id: 5, date: "2024-09-02" },
    { tour_id: 5, date: "2024-09-04" },
    { tour_id: 5, date: "2024-09-06" },
    { tour_id: 5, date: "2024-09-08" },
    { tour_id: 5, date: "2024-09-10" },
    { tour_id: 5, date: "2024-09-12" },
    { tour_id: 5, date: "2024-09-14" },
    { tour_id: 5, date: "2024-09-16" },
    { tour_id: 5, date: "2024-09-18" },
    { tour_id: 5, date: "2024-09-20" },
    { tour_id: 5, date: "2024-09-22" },
    { tour_id: 5, date: "2024-09-24" },
    { tour_id: 5, date: "2024-09-26" },
    { tour_id: 5, date: "2024-09-28" },
    { tour_id: 5, date: "2024-09-30" },

    { tour_id: 6, date: "2024-09-06" },
    { tour_id: 6, date: "2024-09-09" },
    { tour_id: 6, date: "2024-09-13" },
    { tour_id: 6, date: "2024-09-14" },
    { tour_id: 6, date: "2024-09-20" },
    { tour_id: 6, date: "2024-09-21" },
    { tour_id: 6, date: "2024-09-27" },
    { tour_id: 6, date: "2024-09-28" },

    { tour_id: 7, date: "2024-09-02" },
    { tour_id: 7, date: "2024-09-04" },
    { tour_id: 7, date: "2024-09-06" },
    { tour_id: 7, date: "2024-09-08" },
    { tour_id: 7, date: "2024-09-10" },
    { tour_id: 7, date: "2024-09-12" },
    { tour_id: 7, date: "2024-09-14" },
    { tour_id: 7, date: "2024-09-16" },
    { tour_id: 7, date: "2024-09-18" },
    { tour_id: 7, date: "2024-09-20" },
    { tour_id: 7, date: "2024-09-22" },
    { tour_id: 7, date: "2024-09-24" },
    { tour_id: 7, date: "2024-09-26" },
    { tour_id: 7, date: "2024-09-28" },
    { tour_id: 7, date: "2024-09-30" },

    { tour_id: 8, date: "2024-09-02" },
    { tour_id: 8, date: "2024-09-04" },
    { tour_id: 8, date: "2024-09-06" },
    { tour_id: 8, date: "2024-09-08" },
    { tour_id: 8, date: "2024-09-10" },
    { tour_id: 8, date: "2024-09-12" },
    { tour_id: 8, date: "2024-09-14" },
    { tour_id: 8, date: "2024-09-16" },
    { tour_id: 8, date: "2024-09-18" },
    { tour_id: 8, date: "2024-09-20" },
    { tour_id: 8, date: "2024-09-22" },
    { tour_id: 8, date: "2024-09-24" },
    { tour_id: 8, date: "2024-09-26" },
    { tour_id: 8, date: "2024-09-28" },
    { tour_id: 8, date: "2024-09-30" },

    { tour_id: 9, date: "2024-09-02" },
    { tour_id: 9, date: "2024-09-04" },
    { tour_id: 9, date: "2024-09-06" },
    { tour_id: 9, date: "2024-09-08" },
    { tour_id: 9, date: "2024-09-10" },
    { tour_id: 9, date: "2024-09-12" },
    { tour_id: 9, date: "2024-09-14" },
    { tour_id: 9, date: "2024-09-16" },
    { tour_id: 9, date: "2024-09-18" },
    { tour_id: 9, date: "2024-09-20" },
    { tour_id: 9, date: "2024-09-22" },
    { tour_id: 9, date: "2024-09-24" },
    { tour_id: 9, date: "2024-09-26" },
    { tour_id: 9, date: "2024-09-28" },
    { tour_id: 9, date: "2024-09-30" },

    { tour_id: 10, date: "2024-09-01" },
    { tour_id: 10, date: "2024-09-03" },
    { tour_id: 10, date: "2024-09-05" },
    { tour_id: 10, date: "2024-09-09" },
    { tour_id: 10, date: "2024-09-10" },
    { tour_id: 10, date: "2024-09-11" },
    { tour_id: 10, date: "2024-09-13" },
    { tour_id: 10, date: "2024-09-15" },
    { tour_id: 10, date: "2024-09-17" },
    { tour_id: 10, date: "2024-09-19" },
    { tour_id: 10, date: "2024-09-21" },
    { tour_id: 10, date: "2024-09-23" },
    { tour_id: 10, date: "2024-09-25" },
    { tour_id: 10, date: "2024-09-27" },
    { tour_id: 10, date: "2024-09-29" },
    { tour_id: 10, date: "2024-09-28" },
  ]);
}
