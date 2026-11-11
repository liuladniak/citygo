// Single source of truth for the FAQ page and for Milo's typed-question matching.
// Answers are plain text. `keywords` are what Milo looks for in a typed message.
// `link` (optional) adds an "Open →" link under the answer in Milo.
//
// NOTE: policies below are realistic demo policies written for the portfolio
// project. Edit them to match real operations before taking real customers.

export const faqs = [
  {
    id: "cancel",
    question: "Can I cancel or change my booking?",
    answer:
      "Yes. You can cancel free of charge up to 24 hours before your tour starts and get a full refund. Cancellations within 24 hours are not refundable. To move your booking to another date, contact us at least 24 hours before the tour and we'll change it at no extra cost, subject to availability.",
    keywords: [
      "cancel",
      "cancellation",
      "refund",
      "reschedule",
      "change my booking",
      "change my date",
      "change the date",
      "money back",
    ],
    link: { label: "Manage my bookings", to: "/bookings" },
  },
  {
    id: "meeting",
    question: "Where do tours start, and do you offer hotel pickup?",
    answer:
      "Each tour starts at a meeting point in the old city, confirmed in your booking details. Hotel pickup isn't included in our standard tours, but we can arrange it for private tours and transfers. Just ask us.",
    keywords: [
      "meeting point",
      "where do we meet",
      "where do tours start",
      "start location",
      "pickup",
      "pick up",
      "hotel pickup",
    ],
    link: { label: "Private tours", to: "/custom-itinerary" },
  },
  {
    id: "weather",
    question: "What happens if it rains?",
    answer:
      "Most of our tours run in light rain, and your guide will adapt the route if needed. If we have to cancel a tour because of severe weather, you can choose another date or get a full refund.",
    keywords: ["rain", "weather", "storm", "snow", "forecast"],
  },
  {
    id: "languages",
    question: "Which languages are tours offered in?",
    answer:
      "Our tours run in English by default. You can ask for Turkish, French, German, Spanish or Arabic when you book, subject to guide availability.",
    keywords: [
      "language",
      "english",
      "turkish",
      "french",
      "german",
      "spanish",
      "arabic",
      "speak",
    ],
  },
  {
    id: "kids",
    question: "Do children and infants pay?",
    answer:
      "Children aged 2 to 14 pay 50% of the adult price. Infants under 2 travel free. Add everyone's ages when you book so we can plan the right pace.",
    keywords: [
      "child",
      "children",
      "kid",
      "infant",
      "baby",
      "toddler",
      "family friendly",
      "under 2",
    ],
  },
  {
    id: "payment",
    question: "How can I pay, and in which currencies?",
    answer:
      "You pay by card at checkout, securely processed by Stripe. Prices can be shown in USD, EUR or TRY: use the currency selector at the top of the page, and the amount is converted at checkout.",
    keywords: [
      "how can i pay",
      "how do i pay",
      "how to pay",
      "can i pay",
      "payment",
      "credit card",
      "debit card",
      "currency",
      "dollar",
      "euro",
      "lira",
      "visa",
      "mastercard",
      "stripe",
    ],
  },
  {
    id: "accessibility",
    question: "Are tours accessible for wheelchairs and strollers?",
    answer:
      "Accessibility varies by tour, because parts of the old city have stairs and cobblestones. Each tour page lists its accessibility details. If you're unsure, contact us and we'll recommend the best fit.",
    keywords: [
      "wheelchair",
      "stroller",
      "accessible",
      "accessibility",
      "disabled",
      "disability",
      "mobility",
      "elderly",
      "stairs",
      "handicap",
    ],
    link: { label: "Contact us", to: "/contact" },
  },
  {
    id: "bring",
    question: "What should I bring or wear?",
    answer:
      "Comfortable walking shoes, weather-appropriate clothing and some water. When we visit mosques, shoulders and knees should be covered, and women are asked to bring a scarf for their head.",
    keywords: [
      "bring",
      "wear",
      "dress code",
      "clothes",
      "clothing",
      "shoes",
      "pack",
      "backpack",
    ],
  },
  {
    id: "safety",
    question: "Are your guides licensed and are tours safe?",
    answer:
      "Our guides are licensed local professionals, and we keep groups small so everyone can hear and ask questions. If you have any concerns before booking, contact us and we'll gladly help.",
    keywords: [
      "licensed",
      "license",
      "safe",
      "safety",
      "insurance",
      "scam",
      "legit",
      "reliable",
      "trustworthy",
    ],
  },
  {
    id: "groups",
    question: "Do you offer group discounts?",
    answer:
      "Yes. Groups of 10 or more get a discount: contact us with your dates and group size and we'll send a quote. For a tour just for your own group, take a look at our private tours.",
    keywords: ["group", "discount", "corporate", "school", "bulk"],
    link: { label: "Private tours", to: "/custom-itinerary" },
  },
  {
    id: "duration",
    question: "How long are tours and when do they start?",
    answer:
      "Each tour page shows its length and the available time slots, usually a morning and an afternoon departure. Choose a date on the tour page to see the exact times.",
    keywords: [
      "how long",
      "duration",
      "what time",
      "start time",
      "schedule",
      "morning",
      "afternoon",
      "hours",
      "time slot",
    ],
    link: { label: "Browse tours", to: "/tours" },
  },
  {
    id: "confirmation",
    question: "How do I get my booking confirmation?",
    answer:
      "You'll receive a confirmation email once your booking is confirmed, and you can always see your bookings in My Bookings. If nothing arrives within a few minutes, check your spam folder or contact us.",
    keywords: [
      "confirmation",
      "confirm",
      "receipt",
      "voucher",
      "ticket",
      "booking reference",
      "no email",
    ],
    link: { label: "My bookings", to: "/bookings" },
  },
  {
    id: "cruise",
    question: "Do you offer Bosphorus cruises and boat trips?",
    answer:
      "Yes, Bosphorus cruises are part of what we offer, usually a sunset or daytime sail along the strait with views of palaces, bridges and waterfront mansions. Departure times are shown on each tour page. For a private boat or a special occasion such as a proposal or an anniversary, ask us about a custom tour.",
    keywords: [
      "boat",
      "ferry",
      "sail",
      "yacht",
      "by sea",
      "on the water",
    ],
    link: { label: "Browse tours", to: "/tours" },
  },
  {
    id: "beach",
    question: "Can we go to the beach or swim?",
    answer:
      "Our standard tours are city tours and don't include swimming time. Istanbul does have places to swim in summer, usually from May to September: the Black Sea beaches at Kilyos and Sile, about an hour from the centre, and swimming spots on the Princes' Islands. We can build a private day trip around a beach stop, so ask us.",
    keywords: [
      "beach",
      "swim",
      "swimming",
      "swimsuit",
      "sunbathe",
      "seaside",
      "go to the sea",
      "sea swim",
      "black sea",
      "kilyos",
      "sile",
    ],
    link: { label: "Plan a private trip", to: "/custom-itinerary" },
  },
  {
    id: "outdoors",
    question: "Are there outdoor activities like hiking, cycling or nature?",
    answer:
      "Istanbul is mostly a city experience, but there is green space to enjoy. The Princes' Islands are car-free, with bike rides, pine-covered hills and sea views, and the Bosphorus shores have parks for walking. Hiking in the usual sense, such as long trails, isn't part of our standard tours, but we can plan an outdoor day on request.",
    keywords: [
      "hike",
      "hiking",
      "trek",
      "trekking",
      "nature",
      "outdoor",
      "cycling",
      "bike",
      "bicycle",
      "princes islands",
      "prince island",
      "island",
      "park",
      "forest",
    ],
    link: { label: "Plan a private trip", to: "/custom-itinerary" },
  },
  {
    id: "contact",
    question: "How can I contact you?",
    answer:
      "Send us a message through our Help & Contact page and we'll reply by email. You'll also find the phone number at the top of the page.",
    keywords: ["contact", "phone number", "call you", "email you", "support", "reach you"],
    link: { label: "Contact us", to: "/contact" },
  },
];
