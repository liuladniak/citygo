import { Link } from "react-router-dom";
import "./TourListCard.scss";

const TourListCard = ({ tour_name, duration, price, slug }) => {
  console.log(tour_name, duration, price, slug);
  return (
    <Link to={`/tours/${slug}`} className="list-card">
      <span className="list-card__tour-name">{tour_name}</span>
      <span className="list-card__tour-name">{duration}</span>
      <span className="list-card__tour-date">{price}</span>
    </Link>
  );
};

export default TourListCard;
