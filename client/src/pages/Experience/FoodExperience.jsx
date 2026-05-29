import { Link } from "react-router-dom";
import "./ExperiencePage.scss";
import foodImg from "../../assets/images/experience-food.webp";
import { UtensilsCrossed, Sandwich, Fish, Sunset } from "lucide-react";

const affiliates = [
  {
    name: "Karaköy Güllüoğlu",
    description:
      "Istanbul's most celebrated baklava house. The pistachio baklava is the benchmark everything else is judged against.",
    url: "https://www.karakoygulluoglu.com",
    tag: "Baklava",
  },
  {
    name: "Hafız Mustafa 1864",
    description:
      "A legendary pastry and lokum shop with multiple Istanbul locations. The sütlü nuriye (milk baklava) is exceptional.",
    url: "https://www.hafizmustafa.com",
    tag: "Pastry & Desserts",
  },
  {
    name: "Istanbul Eats",
    description:
      "The definitive food blog for Istanbul — neighbourhood guides, restaurant recommendations, and seasonal produce calendars.",
    url: "https://www.istanbuleats.com",
    tag: "Food Guide",
  },
];

const relatedTours = [
  {
    id: 3,
    name: "Istanbul Food and Culture Tour",
    slug: "istanbul-food-and-culture-tour",
    duration: "4 hours",
    price: 55,
  },
  {
    id: 2,
    name: "Bosphorus Cruise and Spice Market Tour",
    slug: "bosphorus-cruise-and-spice-market-tour",
    duration: "6 hours",
    price: 75,
  },
  {
    id: 5,
    name: "Galata Beyoglu Historical and Cultural Tour",
    slug: "galata-beyoglu-historical-and-cultural-tour",
    duration: "3.5 hours",
    price: 50,
  },
];

const gridItems = [
  {
    icon: <UtensilsCrossed size={32} strokeWidth={1.5} />,
    title: "Kahvaltı (Breakfast)",
    text: "Karaköy and Cihangir have Istanbul's best breakfast spots...",
  },
  {
    icon: <Sandwich size={32} strokeWidth={1.5} />,
    title: "Simit",
    text: "The sesame-crusted bread ring sold from red carts...",
  },
  {
    icon: <Fish size={32} strokeWidth={1.5} />,
    title: "Balık Ekmek",
    text: "Grilled mackerel in a half-baguette with lettuce, onion, and lemon...",
  },
  {
    icon: <Sunset size={32} strokeWidth={1.5} />,
    title: "Sunset Dinner",
    text: "The rooftop restaurants in Beyoğlu and along the Bosphorus shore...",
  },
];

const FoodExperience = () => {
  return (
    <article className="exp-page">
      <div className="exp-page__hero">
        <img
          src={foodImg}
          alt="Turkish breakfast spread"
          className="exp-page__hero-img"
        />
        <div className="exp-page__hero-overlay">
          <div className="exp-page__hero-text">
            <span className="exp-page__tag">Food & Culture</span>
            <h1 className="exp-page__title">
              Iconic Breakfasts, Street Food and Dinners with a View
            </h1>
            <p className="exp-page__subtitle">
              Istanbul's food culture is an argument that eating is one of the
              most serious things a city can do.
            </p>
          </div>
        </div>
      </div>

      <div className="exp-page__body">
        <section className="exp-page__section">
          <p className="exp-page__lead">
            The Turkish breakfast — kahvaltı, literally "before coffee" — is a
            statement of intent. A proper spread involves tomatoes, cucumbers,
            white cheese, olives, eggs cooked three ways, honey, kaymak (clotted
            cream), jams, and bread still warm from the oven. It is not a meal
            to rush, and Istanbul takes that seriously.
          </p>
          <p className="exp-page__text">
            But breakfast is just the beginning. The city's street food culture
            runs from dawn to well past midnight — simit sellers at 6am, kokoreç
            carts at noon, midye dolma (stuffed mussels) at dusk, and the balık
            ekmek (fish sandwich) boats bobbing at the Galata Bridge that seem
            to operate in a separate category of delicious entirely.
          </p>
        </section>

        <section className="exp-page__section">
          <h2 className="exp-page__heading">What to Eat and Where</h2>
          <div className="exp-page__grid">
            {gridItems.map((item) => (
              <div key={item.title} className="exp-page__grid-item">
                <span className="exp-page__grid-icon">{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="exp-page__section exp-page__section--tinted">
          <h2 className="exp-page__heading">
            Tips for Eating Well in Istanbul
          </h2>
          <ul className="exp-page__list">
            <li>
              <strong>Follow the locals:</strong> A restaurant full of Turkish
              families at lunch is a reliable signal. Tourist-facing menus in
              English outside the door is the opposite signal.
            </li>
            <li>
              <strong>Meze culture:</strong> Order several small dishes to share
              rather than one large plate. It's how the table is meant to be
              set.
            </li>
            <li>
              <strong>Tea is everywhere:</strong> Offered freely at shops, after
              meals, and between conversations. Refusing is technically
              acceptable but socially odd.
            </li>
            <li>
              <strong>Timing:</strong> Lunch runs 12-2pm, dinner rarely before
              8pm. Arriving at 7pm means you will have the restaurant mostly to
              yourself.
            </li>
            <li>
              <strong>Raki:</strong> The anise spirit that accompanies fish and
              meze. Add water, watch it cloud, drink slowly. It is not a shot.
            </li>
          </ul>
        </section>

        <section className="exp-page__section">
          <h2 className="exp-page__heading">Recommended</h2>
          <div className="exp-page__affiliates">
            {affiliates.map((a) => (
              <a
                key={a.name}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="exp-page__affiliate-card"
              >
                <span className="exp-page__affiliate-tag">{a.tag}</span>
                <h3 className="exp-page__affiliate-name">{a.name}</h3>
                <p className="exp-page__affiliate-desc">{a.description}</p>
                <span className="exp-page__affiliate-link">
                  Visit website →
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className="exp-page__section">
          <h2 className="exp-page__heading">Taste It With a Guide</h2>
          <p className="exp-page__text">
            The difference between eating in Istanbul and eating well in
            Istanbul is often a local who knows which stall, which
            neighbourhood, and which hour.
          </p>
          <div className="exp-page__tours">
            {relatedTours.map((tour) => (
              <Link
                key={tour.id}
                to={`/tours/${tour.slug}`}
                className="exp-page__tour-card"
              >
                <h3 className="exp-page__tour-name">{tour.name}</h3>
                <div className="exp-page__tour-meta">
                  <span>{tour.duration}</span>
                  <span>From ${tour.price}</span>
                </div>
                <span className="exp-page__tour-cta">View tour →</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
};

export default FoodExperience;
