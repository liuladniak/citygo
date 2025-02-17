import "./NotFoundPage.scss";

import Button from "../../components/Button/Button";
import iconError from "../../assets/images/SVG/3.svg";
const NotFoundPage = () => {
  return (
    <div className="">
      <div className="iconError-wrp">
        <img src={iconError} />
      </div>
      <div className="not-found-page">
        <div className="error-wrp">
          <h1 className="error-msg">Page not found...</h1>

          <Button to="/" className="error-link btn--error">
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
