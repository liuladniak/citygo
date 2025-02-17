import Button from "../Button/Button";
import "./Featured.scss";
import contactImg from "../../assets/images/contactImg.png";
const Featured = () => {
  return (
    <div className="featured-wrp">
      <div className="featured">
        <div className="featured-content">
          <div className="featured-text">
            <h2 className="featured-title">Get in touch with us</h2>
            <p className="featured-description">
              We are here to answer any questions you may have. Reach out to us
              and we'll respond as soon as we can. Whether you have inquiries
              about our services, pricing, or anything else, our team is ready
              to assist you.
            </p>
          </div>
          <div className="featured-btns">
            <Button
              className="btn btn--contact"
              to="/contact"
              text="Contact Us"
            />
            <Button
              className="btn btn--contact"
              to="/about"
              text="Get to know us"
            />
          </div>
        </div>
        <div className="featured-img-wrp">
          <img src={contactImg} alt="" className="featured-img" />
        </div>
      </div>
    </div>
  );
};

export default Featured;
