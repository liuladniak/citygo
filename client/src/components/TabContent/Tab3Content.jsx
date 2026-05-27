import "./TabContent.scss";

const Tab3Content = () => {
  return (
    <div className="tab-content tabs-col--2">
      <div className="account-header">
        <h2 className="account-heading">Payment details</h2>
        <span className="account-subheading">
          Add your details for faster booking
        </span>
      </div>

      <div className="account-details account-details--static">
        <div className="account-detail">
          <h3 className="account-detail__title">Gift credit</h3>
          <div className="account-detail__action">
            <button className="account-detail__btn" type="button">
              <span>Add gift certificate</span>
            </button>
          </div>
          <div className="account-detail__always-row">
            <span className="field__input field__input--readonly">
              No gift credit available
            </span>
          </div>
        </div>

        <div className="account-detail">
          <h3 className="account-detail__title">Coupons</h3>
          <div className="account-detail__action">
            <button className="account-detail__btn" type="button">
              <span>Add coupons</span>
            </button>
          </div>
          <div className="account-detail__always-row">
            <span className="field__input field__input--readonly">
              No coupons available
            </span>
          </div>
        </div>

        <div className="account-detail">
          <h3 className="account-detail__title">Your payments</h3>
          <div className="account-detail__action">
            <button className="account-detail__btn" type="button">
              <span>Manage</span>
            </button>
          </div>
          <div className="account-detail__always-row">
            <span className="field__input field__input--readonly">
              Keep track of all your payments and refunds.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tab3Content;
