import { Link } from "react-router-dom";
import { roles, CAREERS_EMAIL } from "./careersData";
import "./Careers.scss";

const values = [
  {
    title: "Local first",
    desc: "We hire people who know and love Istanbul. Authentic local knowledge is at the core of everything we do.",
  },
  {
    title: "People over process",
    desc: "Small team, big impact. We value initiative, ownership, and the ability to get things done without layers of approval.",
  },
  {
    title: "Always learning",
    desc: "Istanbul has endless stories to tell. We look for people who are genuinely curious and keep getting better at what they do.",
  },
  {
    title: "Remote-friendly",
    desc: "Most roles can be done from anywhere. Where it makes sense, we offer flexibility without sacrificing collaboration.",
  },
];

const categories = [...new Set(roles.map((r) => r.category))];

const Careers = () => {
  return (
    <div className="careers">
      <div className="careers__hero">
        <div className="careers__hero-text">
          <span className="careers__tag">Join the team</span>
          <h1 className="careers__title">Help us show Istanbul to the world</h1>
          <p className="careers__subtitle">
            We're a small, passionate team based in Istanbul. We build tours,
            tools, and experiences that help travelers see the city the way
            locals do. If that sounds like work worth doing, we'd love to hear
            from you.
          </p>
          <a href="#positions" className="careers__hero-cta">
            See open positions
          </a>
        </div>
      </div>

      <section className="careers__section careers__values-section">
        <div className="careers__container">
          <h2 className="careers__heading">How we work</h2>
          <div className="careers__values">
            {values.map((v) => (
              <div key={v.title} className="careers__value">
                <h3 className="careers__value-title">{v.title}</h3>
                <p className="careers__value-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="careers__section" id="positions">
        <div className="careers__container">
          <h2 className="careers__heading">Open positions</h2>
          <p className="careers__subheading">
            We're always looking for great people, even when a specific role
            isn't listed. If you don't see an exact fit,{" "}
            <a
              href={`mailto:${CAREERS_EMAIL}`}
              className="careers__inline-link"
            >
              reach out anyway
            </a>
            .
          </p>

          {categories.map((cat) => (
            <div key={cat} className="careers__role-group">
              <h3 className="careers__role-category">{cat}</h3>
              <div className="careers__role-list">
                {roles
                  .filter((r) => r.category === cat)
                  .map((role) => (
                    <Link
                      key={role.slug}
                      to={`/careers/${role.slug}`}
                      className="careers__role-card"
                    >
                      <div className="careers__role-header">
                        <h4 className="careers__role-title">{role.title}</h4>
                        <span className="careers__role-type">{role.type}</span>
                      </div>
                      <p className="careers__role-location">
                        📍 {role.location}
                      </p>
                      <p className="careers__role-desc">{role.summary}</p>
                      <span className="careers__role-read">View role →</span>
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="careers__cta-section">
        <div className="careers__container">
          <div className="careers__cta-box">
            <h2 className="careers__cta-title">Don't see the right role?</h2>
            <p className="careers__cta-desc">
              We're always open to hearing from people who love Istanbul and
              want to be part of what we're building. Send us your CV and a
              short note about what you'd bring to the team.
            </p>
            <a href={`mailto:${CAREERS_EMAIL}`} className="careers__cta-btn">
              {CAREERS_EMAIL}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Careers;
