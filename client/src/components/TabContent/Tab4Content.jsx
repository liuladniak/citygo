import "./Tab4Content.scss";
import "./TabContent.scss";

const Tab4Content = () => {
  return (
    <div>
      <div className="account-header">
        <h2 className="account-heading">Promotions</h2>
        <span className="account-subheading">
          Receive coupons, promotions, surveys, product updates, and travel
          inspiration from CityGo and our partners.
        </span>
      </div>

      <div className="account-details">
        <div className="account-detail">
          <h3 className="account-detail__title">Email</h3>
          <span className="account-subheading">On/Off</span>
        </div>
      </div>
    </div>
  );
};

export default Tab4Content;
