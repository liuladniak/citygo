import TourCard from "../TourCard/TourCard";
import "./ToursIntroList.scss";
import tours from "../../data/data.json";
import arrowRightIcon from "../../assets/icons/chevron-right.svg";
import { Link } from "react-router-dom";

const ToursIntroList = () => {
  const selectedTours = tours.slice(0, 4);
  return (
    <div className="tour-intro-list">
      <h2 className="tour-intro-list__heading">View our tours</h2>
      <div className="tour-intro-wrp">
        {selectedTours.map((tour) => (
          <TourCard
            key={tour.id}
            id={tour.id}
            tour_name={tour.tour_name}
            tour_thumbnail={tour.tour_thumbnail}
            highlights={tour.highlights}
            duration={tour.duration}
            price={tour.price}
            category={tour.category}
          />
        ))}
        <Link to="/tours" className="tour-intro-icon">
          <img src={arrowRightIcon} alt="arrow right icon" />
        </Link>
      </div>
    </div>
  );
};

export default ToursIntroList;
