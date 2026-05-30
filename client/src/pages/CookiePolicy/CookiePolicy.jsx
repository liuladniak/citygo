import "./CookiePolicy.scss";
import { Link } from "react-router-dom";

const cookies = [
  {
    name: "cookie_consent",
    type: "Essential",
    purpose:
      "Stores your cookie consent preference so we don't ask again on every visit.",
    duration: "12 months",
    source: "CityGo",
  },
  {
    name: "sb-access-token",
    type: "Essential",
    purpose:
      "Stores your authentication session token when signed in. Required for account access and booking management.",
    duration: "Session",
    source: "Supabase Auth",
  },
  {
    name: "sb-refresh-token",
    type: "Essential",
    purpose:
      "Allows your session to be refreshed without requiring you to sign in again.",
    duration: "Up to 1 year",
    source: "Supabase Auth",
  },
];

const CookiePolicy = () => {
  return (
    <div className="cookie-policy">
      <div className="cookie-policy__header">
        <h1 className="cookie-policy__title">Cookie Policy</h1>
        <p className="cookie-policy__updated">Last updated: May 2025</p>
      </div>

      <div className="cookie-policy__body">
        <section className="cookie-policy__section">
          <h2 className="cookie-policy__heading">What are cookies</h2>
          <p>
            Cookies are small text files stored on your device when you visit a
            website. They allow the site to remember information about your
            visit — such as whether you're signed in — so you don't have to
            re-enter it every time.
          </p>
        </section>

        <section className="cookie-policy__section">
          <h2 className="cookie-policy__heading">What we use</h2>
          <p>
            CityGo uses only essential cookies. We do not use advertising,
            tracking, or third-party analytics cookies. The table below lists
            everything we set.
          </p>

          <div className="cookie-policy__table-wrap">
            <table className="cookie-policy__table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Purpose</th>
                  <th>Duration</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {cookies.map((c) => (
                  <tr key={c.name}>
                    <td>
                      <code>{c.name}</code>
                    </td>
                    <td>
                      <span className="cookie-policy__badge">{c.type}</span>
                    </td>
                    <td>{c.purpose}</td>
                    <td>{c.duration}</td>
                    <td>{c.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="cookie-policy__cards">
            {cookies.map((c) => (
              <div key={c.name} className="cookie-policy__card">
                <div className="cookie-policy__card-row">
                  <code>{c.name}</code>
                  <span className="cookie-policy__badge">{c.type}</span>
                </div>
                <p>{c.purpose}</p>
                <div className="cookie-policy__card-meta">
                  <span>
                    <strong>Duration:</strong> {c.duration}
                  </span>
                  <span>
                    <strong>Source:</strong> {c.source}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="cookie-policy__section">
          <h2 className="cookie-policy__heading">Essential cookies</h2>
          <p>
            Essential cookies are necessary for the website to function. They
            enable core features like signing in, managing bookings, and
            remembering your preferences. You cannot opt out of essential
            cookies without losing core functionality.
          </p>
        </section>

        <section className="cookie-policy__section">
          <h2 className="cookie-policy__heading">Local storage</h2>
          <p>
            In addition to cookies, CityGo stores some data in your browser's
            local storage. This includes your session data (via Supabase Auth),
            currency preference, and wishlist. Local storage data is not
            transmitted to third parties and stays on your device.
          </p>
        </section>

        <section className="cookie-policy__section">
          <h2 className="cookie-policy__heading">How to manage cookies</h2>
          <p>
            You can control and delete cookies through your browser settings.
            Note that disabling essential cookies will prevent you from signing
            in or completing bookings.
          </p>
          <ul className="cookie-policy__links">
            <li>
              <a
                href="https://support.google.com/chrome/answer/95647"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Chrome
              </a>
            </li>
            <li>
              <a
                href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
                target="_blank"
                rel="noopener noreferrer"
              >
                Mozilla Firefox
              </a>
            </li>
            <li>
              <a
                href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"
                target="_blank"
                rel="noopener noreferrer"
              >
                Safari
              </a>
            </li>
            <li>
              <a
                href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                target="_blank"
                rel="noopener noreferrer"
              >
                Microsoft Edge
              </a>
            </li>
          </ul>
        </section>

        <section className="cookie-policy__section">
          <h2 className="cookie-policy__heading">Changes to this policy</h2>
          <p>
            If we introduce new cookies — for example if we add analytics in the
            future — we will update this page and, where required by law, ask
            for your consent before setting them.
          </p>
        </section>

        <section className="cookie-policy__section">
          <h2 className="cookie-policy__heading">Contact</h2>
          <p>
            Questions about this policy?{" "}
            <Link to="/contact" className="cookie-policy__link">
              Get in touch
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
};

export default CookiePolicy;
