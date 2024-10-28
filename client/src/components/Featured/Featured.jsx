import Button from "../Button/Button";
import "./Featured.scss";

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
          <Button className="btn btn--contact" to="/" text="Contact Us" />
        </div>
      </div>
    </div>
  );
};

export default Featured;
