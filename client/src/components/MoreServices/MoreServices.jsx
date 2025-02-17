import { Link } from "react-router-dom";
import "./MoreServices.scss";

const MoreServices = () => {
  return (
    <section className="more-services">
      <div className="transfers service">
        <h2 className="service__heading">Get inspired</h2>
        <div className="service-wrp">
          <p className="service__desc">
            Get inspired with our top tours, the latest articles, and plenty of
            ideas to help you plan your next adventure.
          </p>
          <Link
            to="/destinations"
            className="btn btn--cta"
            iconClassName="btn--icon"
          >
            Start Exploring
          </Link>
        </div>
        <div className="overlay--more"></div>
      </div>
      <div className="private">
        <h2 className="service__heading">Private tours</h2>
        <div className="service-wrp">
          <p className="service__desc">
            Discover Istanbul with exclusive private tours: tailored
            itineraries, personalized experiences, and dedicated guides.
          </p>

          <Link
            to="/destinations"
            className="btn btn--cta"
            iconClassName="btn--icon"
          >
            View how it works
          </Link>
        </div>
        <div className="overlay--more"></div>
      </div>
    </section>
  );
};

export default MoreServices;
