import "./Tab3Content.scss";
import "./TabContent.scss";
import Button from "../Button/Button";

const Tab3Content = () => {
  return (
    <div>
      {" "}
      <div className="account-header">
        <h2 className="account-heading">Payment details</h2>
        <span className="account-subheading">
          Add your details for faster booking
        </span>
      </div>
      <div className="account-details">
        <div className="account-detail">
          <h3 className="account-detail__title">Gift credit</h3>
          <Button>Add gift certificate</Button>
        </div>
        <div className="account-detail">
          <h3 className="account-detail__title">Coupons</h3>
          <span className="account-subheading">Your coupons</span>
          <Button>Add coupons</Button>
        </div>
        <div className="account-detail">
          <h3 className="account-detail__title">Your payments</h3>
          <span className="account-subheading">
            Keep track of all your payments and refunds.
          </span>
          <Button>Manage payments</Button>
        </div>
      </div>
    </div>
  );
};

export default Tab3Content;
