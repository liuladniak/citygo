import "./Testimonials.scss";

import StarIcon from "../UI/StarIcon";

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
          <span className="testimonials-name">Leona</span>
          <p>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quaerat
            modi odio aliquid, unde omnis minima saepe, nemo molestias vero
            numquam nihil dolorem, qui quasi temporibus totam corporis!
            Architecto, ratione tempore. Lorem ipsum dolor sit, amet consectetur
            adipisicing elit. Vitae veritatis deleniti temporibus minus
            aspernatur. Vitae, at placeat.
          </p>
          <p>
            Visited{" "}
            <span className="testimonials-highlighted">
              Historical Gems of Istanbul Tour
            </span>{" "}
            on <span className="testimonials-highlighted">18 March 2024</span>
          </p>
        </div>
        <div className="testimonials-item">
          <StarIcon />
          <h4 className="testimonials-title">Loved the vibe</h4>
          <span className="testimonials-name">Chirs</span>
          <p>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quaerat
            modi odio aliquid, unde omnis minima saepe, nemo molestias vero
            numquam nihil dolorem, qui quasi temporibus totam corporis!
          </p>
          <p>
            Visited{" "}
            <span className="testimonials-highlighted">
              Historical Gems of Istanbul Tour
            </span>{" "}
            on <span className="testimonials-highlighted">18 March 2024</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
