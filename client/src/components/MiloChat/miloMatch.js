// Typed-question matching for Milo. No AI and no network: plain text matching.
// Order: human request -> FAQ entry -> topic -> specific tour(s) -> broad tours -> null.

import { faqs } from "../../data/faq.js";
import { buildAnswer } from "./miloGuided.js";

export const NO_MATCH_REPLY =
  "I'm not sure about that one yet. Try one of the topics below, or [contact our team →](/contact) and we'll help.";

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "with", "is",
  "are", "do", "you", "your", "i", "we", "me", "my", "can", "have", "any",
  "tour", "istanbul", "price", "what", "about", "there", "it", "this", "that",
]);

// lowercase, strip punctuation, light stemming: ies->y, drop trailing s
const stem = (w) => {
  if (w.length > 4 && w.endsWith("ies")) return `${w.slice(0, -3)}y`;
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
};

export const tokenize = (text) =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(stem);

// " a b c " so phrases only match on whole words
const pad = (tokens) => ` ${tokens.join(" ")} `;

const countHits = (haystack, keywords) =>
  keywords.reduce(
    (n, k) => (haystack.includes(` ${tokenize(k).join(" ")} `) ? n + 1 : n),
    0,
  );

const TOPICS = [
  {
    id: "human",
    keywords: ["talk to a person", "human", "real person", "agent", "speak to someone", "talk to someone", "operator"],
  },
  { id: "popular", keywords: ["popular", "best seller", "bestseller", "must see", "recommend", "best tour", "top tour", "favorite", "first time"] },
  { id: "food", keywords: ["food", "eat", "culinary", "taste", "cuisine", "restaurant", "turkish delight", "kebab"] },
  { id: "private", keywords: ["private", "custom", "custom itinerary", "personalized", "tailor"] },
  { id: "faq", keywords: ["faq", "question"] },
  { id: "tours", keywords: ["price", "cost", "how much", "what tours", "list of tours", "all tours", "offer", "available"] },
];

const matchTopic = (haystack, id) => {
  const t = TOPICS.find((x) => x.id === id);
  return countHits(haystack, t.keywords) > 0;
};

const matchFaq = (haystack) => {
  let best = null;
  let bestHits = 0;
  for (const f of faqs) {
    const hits = countHits(haystack, f.keywords);
    if (hits > bestHits) {
      best = f;
      bestHits = hits;
    }
  }
  return best;
};

const faqReply = (f) =>
  f.link ? `${f.answer}\n\n[${f.link.label} →](${f.link.to})` : f.answer;

const scoreTour = (tour, words) => {
  const name = pad(tokenize(tour.tour_name || ""));
  const cat = pad(tokenize(tour.category || ""));
  const over = pad(tokenize(tour.overview || ""));
  let score = 0;
  for (const w of words) {
    const p = ` ${w} `;
    if (name.includes(p)) score += 3;
    if (cat.includes(p)) score += 2;
    if (over.includes(p)) score += 1;
  }
  return score;
};

const matchTours = (words, tours) => {
  if (!words.length || !tours.length) return [];
  const scored = tours
    .map((t) => ({ t, s: scoreTour(t, words) }))
    .filter((x) => x.s >= 3)
    .sort((a, b) => b.s - a.s);
  if (!scored.length) return [];
  const top = scored[0].s;
  return scored.filter((x) => x.s >= top * 0.6).slice(0, 3).map((x) => x.t);
};

// Returns { reply, source, matchedId }: source is "faq" | "topic" | "tour" | "none";
// matchedId is the FAQ entry or topic id that answered (null for tours / no match).
export const answerTyped = (text, tours = []) => {
  const tokens = tokenize(text);
  const haystack = pad(tokens);

  if (matchTopic(haystack, "human")) {
    return { reply: buildAnswer("human"), source: "topic", matchedId: "human" };
  }

  const faq = matchFaq(haystack);
  if (faq) return { reply: faqReply(faq), source: "faq", matchedId: faq.id };

  for (const id of ["popular", "food", "private", "faq"]) {
    if (matchTopic(haystack, id)) {
      return { reply: buildAnswer(id, tours), source: "topic", matchedId: id };
    }
  }

  const words = tokens.filter((w) => !STOPWORDS.has(w));
  const found = matchTours(words, tours);
  if (found.length) {
    const lines = found
      .map(
        (t) =>
          `**${t.tour_name}** · ${t.duration} · from $${t.price}\n[View tour →](/tours/${t.slug})`,
      )
      .join("\n\n");
    return { reply: `This looks like what you're after:\n\n${lines}`, source: "tour", matchedId: null };
  }

  if (matchTopic(haystack, "tours")) {
    return { reply: buildAnswer("tours", tours), source: "topic", matchedId: "tours" };
  }

  return { reply: NO_MATCH_REPLY, source: "none", matchedId: null };
};
