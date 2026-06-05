import { useParams, Link, Navigate } from "react-router-dom";
import { roles, CAREERS_EMAIL } from "./careersData";
import "./Careers.scss";

const CareerDetail = () => {
  const { slug } = useParams();
  const role = roles.find((r) => r.slug === slug);

  if (!role) return <Navigate to="/careers" replace />;

  const mailSubject = encodeURIComponent(`Application — ${role.title}`);
  const mailBody = encodeURIComponent(
    `Hi CityGo team,\n\nI'm applying for the ${role.title} position.\n\n[Please attach your CV and write a short intro here]\n\nBest regards,`,
  );

  return (
    <div className="careers">
      <div className="career-detail__back-bar">
        <div className="careers__container">
          <Link to="/careers" className="career-detail__back">
            ← All positions
          </Link>
        </div>
      </div>

      <div className="career-detail__header">
        <div className="careers__container">
          <span className="careers__tag">{role.category}</span>
          <h1 className="career-detail__title">{role.title}</h1>
          <div className="career-detail__meta">
            <span className="careers__role-type">{role.type}</span>
            <span className="career-detail__location">📍 {role.location}</span>
          </div>
          <a
            href={`mailto:${CAREERS_EMAIL}?subject=${mailSubject}&body=${mailBody}`}
            className="career-detail__apply-btn"
          >
            Apply for this role
          </a>
        </div>
      </div>

      <div className="career-detail__body">
        <div className="careers__container career-detail__layout">
          <div className="career-detail__content">
            <section className="career-detail__section">
              <h2 className="career-detail__section-heading">About the role</h2>
              {role.description.split("\n\n").map((para, i) => (
                <p key={i} className="career-detail__para">
                  {para}
                </p>
              ))}
            </section>

            <section className="career-detail__section">
              <h2 className="career-detail__section-heading">What you'll do</h2>
              <ul className="career-detail__list">
                {role.responsibilities.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="career-detail__section">
              <h2 className="career-detail__section-heading">
                What we're looking for
              </h2>
              <ul className="career-detail__list">
                {role.requirements.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>

            {role.niceToHave?.length > 0 && (
              <section className="career-detail__section">
                <h2 className="career-detail__section-heading">Nice to have</h2>
                <ul className="career-detail__list career-detail__list--secondary">
                  {role.niceToHave.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </section>
            )}

            <section className="career-detail__section">
              <h2 className="career-detail__section-heading">What we offer</h2>
              <ul className="career-detail__list career-detail__list--offer">
                {role.whatWeOffer.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="career-detail__sidebar">
            <div className="career-detail__sidebar-card">
              <h3 className="career-detail__sidebar-title">
                Apply for this role
              </h3>
              <p className="career-detail__sidebar-desc">
                Send your CV and a short cover note to our team. We read every
                application and respond within 5 business days.
              </p>
              <a
                href={`mailto:${CAREERS_EMAIL}?subject=${mailSubject}&body=${mailBody}`}
                className="career-detail__apply-btn career-detail__apply-btn--full"
              >
                Apply via email
              </a>
              <p className="career-detail__sidebar-email">
                or email us directly at{" "}
                <a href={`mailto:${CAREERS_EMAIL}`}>{CAREERS_EMAIL}</a>
              </p>

              <div className="career-detail__sidebar-meta">
                <div className="career-detail__sidebar-row">
                  <span className="career-detail__sidebar-label">Type</span>
                  <span>{role.type}</span>
                </div>
                <div className="career-detail__sidebar-row">
                  <span className="career-detail__sidebar-label">Location</span>
                  <span>{role.location}</span>
                </div>
                <div className="career-detail__sidebar-row">
                  <span className="career-detail__sidebar-label">
                    Department
                  </span>
                  <span>{role.category}</span>
                </div>
              </div>
            </div>

            <div className="career-detail__sidebar-other">
              <h4 className="career-detail__sidebar-other-title">
                Other open roles
              </h4>
              {roles
                .filter((r) => r.slug !== slug)
                .slice(0, 3)
                .map((r) => (
                  <Link
                    key={r.slug}
                    to={`/careers/${r.slug}`}
                    className="career-detail__sidebar-other-link"
                  >
                    <span>{r.title}</span>
                    <span className="career-detail__sidebar-other-type">
                      {r.type}
                    </span>
                  </Link>
                ))}
              <Link to="/careers" className="career-detail__sidebar-all">
                View all positions →
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <section className="careers__cta-section">
        <div className="careers__container">
          <div className="careers__cta-box">
            <h2 className="careers__cta-title">Ready to apply?</h2>
            <p className="careers__cta-desc">
              Send your CV and a short note about why this role is a good fit.
              We look forward to hearing from you.
            </p>
            <a
              href={`mailto:${CAREERS_EMAIL}?subject=${mailSubject}&body=${mailBody}`}
              className="careers__cta-btn"
            >
              Apply for {role.title}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CareerDetail;
