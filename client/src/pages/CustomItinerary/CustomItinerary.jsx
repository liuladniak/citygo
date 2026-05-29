import { Link } from "react-router-dom";
import "./CustomItinerary.scss";

const steps = [
  {
    number: "01",
    title: "Tell us what excites you",
    description:
      "Fill in our contact form or send us a message with the basics — travel dates, group size, interests, and any must-sees or must-avoids. No need for a detailed plan. A few sentences is enough to start.",
  },
  {
    number: "02",
    title: "We put together a proposal",
    description:
      "Within 24-48 hours, one of our local team will come back to you with a suggested itinerary, a guide recommendation, and a price. You can accept it as-is, or we iterate until it feels right.",
  },
  {
    number: "03",
    title: "We confirm and prepare",
    description:
      "Once you confirm, we handle everything — guide assignment, logistics, any reservations needed. You receive a full briefing document with meeting point, timings, and your guide's contact details.",
  },
  {
    number: "04",
    title: "You arrive, we take it from there",
    description:
      "On the day, your guide meets you at the agreed point and takes care of the rest. If anything needs adjusting on the day, your guide has the flexibility to adapt.",
  },
];

const examples = [
  {
    title: "Family with children (ages 6–12)",
    description:
      "Half-day in the Old City focused on storytelling and interactive history — no long queues, no overloaded museums. Ends with ice cream at a gelateria the tourists haven't found yet.",
    duration: "4–5 hours",
  },
  {
    title: "Architecture enthusiasts",
    description:
      "A full day covering Byzantine, Ottoman, and early Republican-era buildings across four neighbourhoods. Includes rooftop access and a visit to a restoration site not open to general visitors.",
    duration: "7–8 hours",
  },
  {
    title: "Food-focused couple",
    description:
      "Morning market visit, mid-morning pastry tour in Karaköy, lunch with a chef at a neighbourhood lokanta, afternoon in the Spice Bazaar, sunset fish dinner on the Bosphorus shore.",
    duration: "Full day",
  },
  {
    title: "Solo photographer",
    description:
      "Pre-dawn departure to catch the empty streets and the call to prayer, followed by a structured shoot through Balat and the Golden Horn before the crowds arrive.",
    duration: "4 hours (early morning)",
  },
];

const CustomItinerary = () => {
  return (
    <div className="custom-page">
      {/* ─── hero ─────────────────────────────────────────────────────────── */}
      <div className="custom-page__hero">
        <img
          src="https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1400&q=80"
          alt="Istanbul skyline"
          className="custom-page__hero-img"
        />
        <div className="custom-page__hero-overlay">
          <div className="custom-page__hero-text">
            <h1 className="custom-page__title">Create Your Own Itinerary</h1>
            <p className="custom-page__subtitle">
              Tell us what you want to see. We'll handle everything else.
            </p>
          </div>
        </div>
      </div>

      <div className="custom-page__body">
        {/* ─── intro ──────────────────────────────────────────────────────── */}
        <section className="custom-page__section custom-page__section--narrow">
          <p className="custom-page__lead">
            Our fixed tours cover the experiences most visitors come to Istanbul
            for. But sometimes what you're looking for doesn't fit a pre-set
            route — a specific neighbourhood, a particular interest, a group
            with mixed ages, or simply the desire to move at your own pace with
            someone who knows the city well.
          </p>
          <p className="custom-page__text">
            Custom itineraries are built from scratch around you. They cost more
            than our standard tours and take a little more time to arrange —
            usually 24–48 hours from first contact to confirmed plan. In return,
            you get an experience that's genuinely yours.
          </p>
        </section>

        {/* ─── how it works ───────────────────────────────────────────────── */}
        <section className="custom-page__section">
          <h2 className="custom-page__heading">How It Works</h2>
          <div className="custom-page__steps">
            {steps.map((step) => (
              <div key={step.number} className="custom-page__step">
                <span className="custom-page__step-number">{step.number}</span>
                <div className="custom-page__step-content">
                  <h3 className="custom-page__step-title">{step.title}</h3>
                  <p className="custom-page__step-desc">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── examples ───────────────────────────────────────────────────── */}
        <section className="custom-page__section custom-page__section--tinted">
          <h2 className="custom-page__heading">Some Examples</h2>
          <p className="custom-page__text">
            These are not templates — just a sense of what's been arranged
            before.
          </p>
          <div className="custom-page__examples">
            {examples.map((ex) => (
              <div key={ex.title} className="custom-page__example">
                <h3 className="custom-page__example-title">{ex.title}</h3>
                <p className="custom-page__example-desc">{ex.description}</p>
                <span className="custom-page__example-duration">
                  {ex.duration}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── what we need from you ──────────────────────────────────────── */}
        <section className="custom-page__section custom-page__section--narrow">
          <h2 className="custom-page__heading">What We Need From You</h2>
          <ul className="custom-page__list">
            <li>Travel dates and how many days you have in Istanbul</li>
            <li>
              Group size and any relevant details (children, mobility
              considerations, dietary needs)
            </li>
            <li>
              What you're interested in — even vague answers like "history but
              not museums" are useful
            </li>
            <li>Budget range if you have one in mind</li>
            <li>Anything you want to avoid</li>
          </ul>
          <p className="custom-page__text">
            That's it. The more you tell us, the better the first proposal — but
            we can work with very little and ask follow-up questions if needed.
          </p>
        </section>

        {/* ─── CTA ────────────────────────────────────────────────────────── */}
        <section className="custom-page__cta-section">
          <div className="custom-page__cta-box">
            <h2 className="custom-page__cta-title">Ready to start planning?</h2>
            <p className="custom-page__cta-desc">
              Send us a message and we'll come back to you within 24 hours with
              a first proposal.
            </p>
            <Link to="/contact" className="custom-page__cta-btn">
              Get in touch
            </Link>
          </div>
        </section>

        {/* ─── browse standard tours ──────────────────────────────────────── */}
        <section className="custom-page__section custom-page__section--narrow">
          <p className="custom-page__text" style={{ textAlign: "center" }}>
            Not sure a custom tour is right for you?{" "}
            <Link to="/tours" className="custom-page__link">
              Browse our fixed tours
            </Link>{" "}
            — they cover the most popular experiences and are available to book
            immediately.
          </p>
        </section>
      </div>
    </div>
  );
};

export default CustomItinerary;
