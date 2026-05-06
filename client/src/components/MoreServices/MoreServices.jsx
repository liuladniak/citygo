import { Link } from "react-router-dom";
import "./MoreServices.scss";

const MoreServices = () => {
  return (
    <section className="more-services">
      <div className="transfers service">
        <div className="overlay--more" />
        <h2 className="service__heading">Get inspired</h2>
        <div className="service-wrp">
          <p className="service__desc">
            Discover our top tours, the latest articles, and ideas to help you
            plan your next Istanbul adventure.
          </p>
          <Link to="/destinations" className="btn btn--cta">
            Start Exploring
          </Link>
        </div>
      </div>

      <div className="private service">
        <div className="overlay--more" />
        <h2 className="service__heading">Private tours</h2>
        <div className="service-wrp">
          <p className="service__desc">
            Tailored itineraries, personalized experiences, and dedicated guides
            — exclusively for your group.
          </p>
          <Link to="/destinations" className="btn btn--cta">
            View how it works
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MoreServices;
