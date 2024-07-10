import { Link } from "react-router-dom";
import "./TourCard.scss";
import Button from "../Button/Button";
import timeIcon from "../../assets/icons/time-icon-red.png";
import chevronRightIcon from "../../assets/icons/chevron-right.svg";
const TourCard = ({
  id,
  tour_name,
  tour_thumbnail,
  highlights = [],
  duration,
  price,
  category,
}) => {
  const highlightsList = highlights.join(", ");

  const getCategoryClass = (category) => {
    switch (category) {
      case "Guided tour":
        return "guided-tour";
      case "Culinary tour":
        return "culinary-tour";
      case "Experience":
        return "experience";
      default:
        return "";
    }
  };
  return (
    <Link className="tour-card" to={`/tours/${id}`}>
      <div className="tour-card">
        <div className="tour-card__img-wrp">
          <img src={tour_thumbnail} alt="tour image" />
        </div>
        <div className="tour-card__content">
          <h3 className="tour-card__heading">{tour_name}</h3>
          <div className="tour-card__tags">
            <div className="tour-card__duration">
              <div className="tour-card__duration-icon">
                <img src={timeIcon} alt="icon time" />
              </div>
              <h5 className="tour-card__duration-hour">{duration}</h5>
            </div>
            <div
              className={`tour-card__category ${getCategoryClass(category)}`}
            >
              {category}
            </div>
          </div>
          <div className="tour-card__highlights">
            <p className="tour-card__highlights-list">{highlightsList}</p>
          </div>
          <div className="tour-card__bottom">
            <div className="tour-card__price">
              <h5 className="tour-card__price-number">USD {price}</h5>
            </div>
            <Button className="btn--view-details" iconUrl={chevronRightIcon}>
              View details
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TourCard;
