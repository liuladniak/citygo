import { Link } from "react-router-dom";
import EditIcon from "../ui/SVGIcons/EditIcon";

const TourListCard = ({ tour_image, tour_name, duration, price, slug }) => {
  const API_URL = import.meta.env.VITE_API_KEY;
  console.log(tour_name, duration, price, slug);

  return (
    <Link
      to={`/tours/${slug}`}
      className="w-80 h-80 list-card text-sm flex flex-col border border-borderGra rounded-md"
    >
      <div className="w-full h-40 rounded-md overflow-hidden ">
        <img
          className="h-full"
          src={`${API_URL}/${tour_image}`}
          alt="tour main image"
        />
      </div>
      <span className="list-card__tour-name">{tour_name}</span>
      <div className="flex justify-between">
        <span className="list-card__tour-name">{duration}</span>
        <span className="list-card__tour-date">{price}</span>
      </div>

      <div className="flex justify-between p-2">
        <div className="rounded-md flex items-center bg-green-100 py-0.5 px-2.5 border border-transparent text-sm text-green-800 transition-all shadow-sm">
          <div className="mx-auto block h-2 w-2 rounded-full bg-green-800 mr-2"></div>
          Active
        </div>
        <Link to={`/tours/${slug}/edit`} className="list-card__tour-icon">
          <EditIcon />
        </Link>
      </div>
    </Link>
  );
};

export default TourListCard;
