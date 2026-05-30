import { Link } from "react-router-dom";
import "./CookieBanner.scss";

const CookieBanner = ({ onAcceptAll, onRejectAll }) => {
  return (
    <div
      className="cookie-banner"
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
    >
      <div className="cookie-banner__inner">
        <div className="cookie-banner__text">
          <p className="cookie-banner__message">
            We use essential cookies to keep the site working — for sign-in and
            bookings. No tracking, no advertising.{" "}
            <Link to="/cookie-policy" className="cookie-banner__link">
              Cookie Policy
            </Link>
          </p>
        </div>
        <div className="cookie-banner__actions">
          <button
            type="button"
            className="cookie-banner__btn cookie-banner__btn--reject"
            onClick={onRejectAll}
          >
            Essential only
          </button>
          <button
            type="button"
            className="cookie-banner__btn cookie-banner__btn--accept"
            onClick={onAcceptAll}
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
