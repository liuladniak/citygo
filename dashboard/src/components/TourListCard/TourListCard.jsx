import { Link } from "react-router-dom";
import "./TourListCard.css";
import EditIcon from "../ui/SVGIcons/EditIcon";

const TourListCard = ({ tour_image, tour_name, duration, price, slug }) => {
  const API_URL = import.meta.env.VITE_API_KEY;
  console.log(tour_name, duration, price, slug);

  return (
    <Link to={`/tours/${slug}`} className="list-card text-sm">
      <div className="w-40 h-24 rounded-lg overflow-hidden ">
        <img
          className="h-full"
          src={`${API_URL}/${tour_image}`}
          alt="tour main image"
        />
      </div>
      <span className="list-card__tour-name">{tour_name}</span>
      <span className="list-card__tour-name">{duration}</span>
      <span className="list-card__tour-date">{price}</span>
      <Link to={`/tours/${slug}/edit`} className="list-card__tour-icon">
        <EditIcon />
      </Link>
    </Link>
  );
};

export default TourListCard;
