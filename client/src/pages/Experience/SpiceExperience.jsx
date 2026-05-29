import { Link } from "react-router-dom";
import "./ExperiencePage.scss";
import spiceImg from "../../assets/images/experience-spice.webp";

import { Flower2, Coffee, Candy, Leaf } from "lucide-react";

const gridItems = [
  {
    icon: <Flower2 size={32} strokeWidth={1.5} />,
    title: "Saffron",
    text: "Iran produces most of the world's saffron and it passes through Istanbul on its way west. Look for deep crimson threads — orange or yellow usually signals lower quality or adulteration.",
  },
  {
    icon: <Coffee size={32} strokeWidth={1.5} />,
    title: "Turkish Tea",
    text: "Rize province on the Black Sea coast produces Turkey's famous çay. Buy loose leaf, not bags — the difference in flavour is significant.",
  },
  {
    icon: <Candy size={32} strokeWidth={1.5} />,
    title: "Lokum",
    text: "Turkish delight ranges from tourist-grade sugar blocks to genuinely extraordinary confections made with real rose water and pistachios. Ask to taste before buying.",
  },
  {
    icon: <Leaf size={32} strokeWidth={1.5} />,
    title: "Sumac & Za'atar",
    text: "Both are essential to Turkish and Middle Eastern cooking. Sumac adds tartness where lemon would overpower; za'atar is a blend worth taking home by the bag.",
  },
];

const affiliates = [
  {
    name: "Kurukahveci Mehmet Efendi",
    description:
      "Istanbul's most iconic coffee and spice house, operating since 1871 in the Egyptian Bazaar.",
    url: "https://www.mehmetefendi.com",
    tag: "Coffee & Spices",
  },
  {
    name: "Ali Muhiddin Hacı Bekir",
    description:
      "The original Turkish delight shop, founded in 1777. Ships worldwide.",
    url: "https://www.hacibekir.com",
    tag: "Turkish Delight",
  },
  {
    name: "Grand Bazaar Istanbul",
    description:
      "Official portal for the Grand Bazaar — vendor directory, opening hours, and visitor guide.",
    url: "https://grandbazaaristanbul.org",
    tag: "Shopping Guide",
  },
];

const relatedTours = [
  {
    id: 2,
    name: "Bosphorus Cruise and Spice Market Tour",
    slug: "bosphorus-cruise-and-spice-market-tour",
    duration: "6 hours",
    price: 75,
  },
  {
    id: 3,
    name: "Istanbul Food and Culture Tour",
    slug: "istanbul-food-and-culture-tour",
    duration: "4 hours",
    price: 55,
  },
  {
    id: 7,
    name: "Istanbul Shopping Tour",
    slug: "istanbul-shopping-tour",
    duration: "4 hours",
    price: 45,
  },
];

const SpiceExperience = () => {
  return (
    <article className="exp-page">
      <div className="exp-page__hero">
        <img
          src={spiceImg}
          alt="Spices at the Egyptian Bazaar"
          className="exp-page__hero-img"
        />
        <div className="exp-page__hero-overlay">
          <div className="exp-page__hero-text">
            <span className="exp-page__tag">Sensory Experience</span>
            <h1 className="exp-page__title">
              A Sensory Journey: Discover the Spices of Two Continents
            </h1>
            <p className="exp-page__subtitle">
              Istanbul sits at the crossroads of Europe and Asia — and nowhere
              is that more alive than in its spice markets.
            </p>
          </div>
        </div>
      </div>

      <div className="exp-page__body">
        <section className="exp-page__section">
          <p className="exp-page__lead">
            The Egyptian Bazaar — known locally as Mısır Çarşısı — has been the
            beating heart of Istanbul's spice trade since 1664. Built as part of
            the New Mosque complex to generate revenue for its upkeep, it
            quickly became the city's most aromatic landmark. Today it remains
            one of the oldest and most visited covered markets in the world.
          </p>
          <p className="exp-page__text">
            Step inside and the air changes immediately. Sacks of sumac, dried
            rose petals, turmeric, and black cumin line the stalls in vivid
            columns of colour. Vendors call out in a dozen languages. Teas from
            Rize, saffron from Iran, Aleppo pepper from Syria — the market
            distills centuries of trade routes into a single covered hall.
          </p>
        </section>

        <section className="exp-page__section">
          <h2 className="exp-page__heading">What to Look For</h2>
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
          <h2 className="exp-page__heading">Practical Information</h2>
          <ul className="exp-page__list">
            <li>
              <strong>Opening hours:</strong> Monday to Saturday, 8am – 7:30pm.
              Closed Sundays.
            </li>
            <li>
              <strong>Best time to visit:</strong> Early morning (before 10am)
              or late afternoon (after 4pm) to avoid the cruise ship crowds.
            </li>
            <li>
              <strong>Getting there:</strong> Tram stop Eminönü, a 2-minute
              walk. Also accessible by ferry from Karaköy and Üsküdar.
            </li>
            <li>
              <strong>Bargaining:</strong> Expected at most stalls, but not
              aggressive. A smile and genuine interest go further than hard
              negotiation.
            </li>
            <li>
              <strong>Watch out for:</strong> Stalls near the main entrance
              charge tourist prices. Walk deeper into the bazaar for better
              quality and fairer rates.
            </li>
          </ul>
        </section>

        <section className="exp-page__section">
          <h2 className="exp-page__heading">Where to Shop</h2>
          <p className="exp-page__text">
            A few vendors worth knowing before you go:
          </p>
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
          <h2 className="exp-page__heading">Experience It With a Guide</h2>
          <p className="exp-page__text">
            Visiting the bazaar with a local guide unlocks a different
            experience — side streets, trusted vendors, and context that no map
            provides.
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

export default SpiceExperience;
