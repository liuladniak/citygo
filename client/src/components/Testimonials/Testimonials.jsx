import "./Testimonials.scss";

import StarIcon from "../UI/StarIcon";
import { NavLink } from "react-router-dom";

const Testimonials = () => {
  return (
    <div className="destinations-testimonials">
      <h3 className="destinations-heading">User stories</h3>
      <div className="testimonials-list">
        <div className="testimonials-item">
          <StarIcon />

          <h4 className="testimonials-title">
            Great tour, fun and knowledgeable guide!
          </h4>
          <span className="testimonials-name">Leona, France</span>
          <p>
            Our guide, Emre, was fantastic! He shared so many hidden details
            about the Hagia Sophia that I would have never noticed on my own.
            Walking through the Grand Bazaar was such a unique experience - I
            even got to try some freshly made Turkish delight at a tiny shop
            tucked away in one of the quieter corners. Definitely an
            unforgettable experience.
          </p>
          <p className="testimonials-desc">
            Visited{" "}
            <NavLink
              to="/tours/historical-istanbul-walking-tour"
              className="testimonials-highlighted"
            >
              Historical Istanbul Walking Tour
            </NavLink>{" "}
            on <span className="testimonials-highlighted">18 March 2024</span>
          </p>
        </div>
        <div className="testimonials-item">
          <StarIcon />
          <h4 className="testimonials-title">Loved the vibe</h4>
          <span className="testimonials-name">Chirs, USA</span>
          <p>
            This tour had such a great energy! The boat ride on the Bosphorus at
            sunset was stunning, and the way the city lights reflected on the
            water was unreal. At the Spice Market, I found a tiny shop selling
            saffron and the freshest pistachios I’ve ever had. I also met Jake
            from Australia during the tour, and we ended up exploring more of
            Istanbul together the next day - still friends to this day! A truly
            special experience.
          </p>
          <p className="testimonials-desc">
            Visited{" "}
            <NavLink
              to="/tours/bosphorus-cruise-and-spice-market-tour"
              className="testimonials-highlighted"
            >
              Bosphorus Cruise and Spice Market Tour
            </NavLink>{" "}
            on <span className="testimonials-highlighted">18 March 2024</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
