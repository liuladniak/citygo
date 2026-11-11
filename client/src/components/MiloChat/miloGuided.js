// Guided (no-AI) answers for Milo. Pure functions: easy to test, nothing invented.

export const MENU = [
  { id: "tours", label: "What tours do you offer?" },
  { id: "popular", label: "Most popular tours" },
  { id: "food", label: "Food tours: what will I eat?" },
  { id: "private", label: "Private or custom tours?" },
  { id: "faq", label: "Read our FAQ" },
  { id: "human", label: "Talk to a person" },
];

// Chips whose answer needs the live tours list
export const NEEDS_TOURS = ["tours", "popular", "food"];

const tourLine = (t) =>
  `**${t.tour_name}** · ${t.duration} · from $${t.price}\n[View tour →](/tours/${t.slug})`;

const list = (tours, max) => tours.slice(0, max).map(tourLine).join("\n\n");

export const pickPopular = (tours) => {
  const best = tours.filter((t) => t.best_seller);
  if (best.length) return best;
  const featured = tours.filter((t) => t.featured);
  return featured.length ? featured : tours;
};

export const buildAnswer = (id, tours = []) => {
  switch (id) {
    case "tours":
      return tours.length
        ? `Here are some of our Istanbul tours:\n\n${list(tours, 6)}\n\n[See all tours →](/tours)`
        : "You can browse every tour here: [See all tours →](/tours)";

    case "popular": {
      const picks = pickPopular(tours);
      return picks.length
        ? `These are the tours travelers love most:\n\n${list(picks, 3)}\n\n[See all tours →](/tours)`
        : "Browse all our tours here: [See all tours →](/tours)";
    }

    case "food": {
      const food = tours.filter((t) => t.category === "Culinary tour");
      return food.length
        ? `Hungry? These tours are all about food:\n\n${list(food, 4)}\n\n[More food experiences →](/experiences/food)`
        : "Food is a big part of Istanbul. Take a look here: [Food experiences →](/experiences/food)";
    }

    case "private":
      return "Yes! We build private and custom tours around your group, your interests and your pace, with a dedicated guide.\n\n[See how it works →](/custom-itinerary)";

    case "faq":
      return "You'll find answers to the most common questions on our Help & Contact page, with a form if you need more.\n\n[Open the FAQ →](/contact)";

    case "human":
      return "Live chat with our team is coming soon. For now, send us a message and we'll reply by email.\n\n[Contact us →](/contact)";

    default:
      return "I can help with tours and Istanbul travel. Pick one of the options below.";
  }
};
