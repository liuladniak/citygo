import "./TabContent.scss";
import { useState } from "react";

const Tab4Content = ({ user }) => {
  const [emailPromo, setEmailPromo] = useState(user?.email_promotions ?? false);

  return (
    <div className="tab-content tabs-col--2">
      <div className="account-header">
        <h2 className="account-heading">Promotions</h2>
        <span className="account-subheading">
          Receive coupons, promotions, surveys, product updates, and travel
          inspiration from CityGo and our partners.
        </span>
      </div>

      <div className="account-details account-details--static">
        <div className="account-detail">
          <h3 className="account-detail__title">Email notifications</h3>
          <div className="account-detail__action">
            <button
              className={`promo-toggle${emailPromo ? " promo-toggle--on" : ""}`}
              type="button"
              onClick={() => setEmailPromo(!emailPromo)}
              aria-label="Toggle email promotions"
            >
              <span className="promo-toggle__knob" />
            </button>
          </div>
          <div className="account-detail__always-row">
            <span
              className={`field__input field__input--readonly${!emailPromo ? " field__input--empty" : ""}`}
            >
              {emailPromo ? "Subscribed to email updates" : "Not subscribed"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tab4Content;
