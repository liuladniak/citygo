import { Link } from "react-router-dom";
import "./ExperiencePage.scss";
import hamamImg from "../../assets/images/experience-hamam.webp";
import { Brush, Wind, Square, Waves } from "lucide-react";

const affiliates = [
  {
    name: "Çemberlitaş Hamamı",
    description:
      "One of Istanbul's oldest and most atmospheric hammams, designed by Mimar Sinan in 1584. Fully operational and open to visitors.",
    url: "https://www.cemberlitashamami.com",
    tag: "Historic Hammam",
  },
  {
    name: "Kılıç Ali Paşa Hamamı",
    description:
      "A restored 16th-century hammam in Tophane, considered one of the finest restoration projects in Istanbul. Book in advance.",
    url: "https://www.kilicalipasahamami.com",
    tag: "Luxury Restoration",
  },
  {
    name: "Aqua Club Dolphin",
    description:
      "Modern thermal spa complex on the European side with mineral pools, saunas, and treatment rooms.",
    url: "https://www.aquaclubdolphin.com",
    tag: "Thermal Spa",
  },
];

const relatedTours = [
  {
    id: 1,
    name: "Historical Istanbul Walking Tour",
    slug: "historical-istanbul-walking-tour",
    duration: "3 hours",
    price: 45,
  },
  {
    id: 4,
    name: "Historical Gems of Istanbul Tour",
    slug: "historical-gems-of-istanbul-tour",
    duration: "5 hours",
    price: 65,
  },
];

const gridItems = [
  {
    icon: <Brush size={32} strokeWidth={1.5} />,
    title: "The Kese (Scrub)",
    text: "A rough mitt exfoliation that removes dead skin...",
  },
  {
    icon: <Wind size={32} strokeWidth={1.5} />,
    title: "The Köpük (Foam Massage)",
    text: "A full-body massage using a pillowcase filled with soap foam...",
  },
  {
    icon: <Square size={32} strokeWidth={1.5} />,
    title: "The Göbek Taşı",
    text: "The heated marble navel stone at the centre of the hot room...",
  },
  {
    icon: <Waves size={32} strokeWidth={1.5} />,
    title: "Thermal Pools",
    text: "Several spas in Istanbul offer mineral-rich thermal pools...",
  },
];
const HamamExperience = () => {
  return (
    <article className="exp-page">
      <div className="exp-page__hero">
        <img
          src={hamamImg}
          alt="Turkish Hammam"
          className="exp-page__hero-img"
        />
        <div className="exp-page__hero-overlay">
          <div className="exp-page__hero-text">
            <span className="exp-page__tag">Wellness & Culture</span>
            <h1 className="exp-page__title">
              Full Reboot in Hammam, Turkish & Thermal Spas
            </h1>
            <p className="exp-page__subtitle">
              Five centuries of bathing culture, still very much alive — and
              still the best way to wash off a long journey.
            </p>
          </div>
        </div>
      </div>

      <div className="exp-page__body">
        <section className="exp-page__section">
          <p className="exp-page__lead">
            The hammam is one of the great Ottoman institutions — not merely a
            place to bathe, but a social ritual that cut across class, gender,
            and occasion. Births, marriages, pre-military gatherings — all were
            marked with a visit to the hammam. At its peak, Istanbul had over
            150 active hammams. Around 60 remain operational today.
          </p>
          <p className="exp-page__text">
            A traditional hammam experience follows a sequence: first the warm
            room (ılıklık) to open the pores, then the hot marble slab (göbek
            taşı) for the scrub and foam massage, then cooling down and resting
            with tea. The whole process takes 45 minutes to two hours depending
            on the treatment. Most visitors describe it as the most relaxed they
            have felt in years.
          </p>
        </section>

        <section className="exp-page__section">
          <h2 className="exp-page__heading">What to Expect</h2>
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
              <strong>What to bring:</strong> Nothing. Towels, slippers, and
              pestemal (traditional cotton wrap) are provided.
            </li>
            <li>
              <strong>What to wear:</strong> You undress to your underwear or to
              nothing, depending on the hammam and your preference. Attendants
              are professionals.
            </li>
            <li>
              <strong>Duration:</strong> Allow at least 90 minutes. Rushing a
              hammam defeats the purpose.
            </li>
            <li>
              <strong>Booking:</strong> Historic hammams fill up — book at least
              24 hours in advance, especially on weekends.
            </li>
            <li>
              <strong>Tipping:</strong> 10-15% is standard for the attendant
              (tellak or natır). Hand it directly, not through the reception.
            </li>
          </ul>
        </section>

        <section className="exp-page__section">
          <h2 className="exp-page__heading">Where to Go</h2>
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
          <h2 className="exp-page__heading">Explore the History Around It</h2>
          <p className="exp-page__text">
            Istanbul's historic hammams sit in some of the city's most
            significant neighbourhoods. Pair your visit with a walking tour to
            understand the architecture and culture surrounding them.
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

export default HamamExperience;
