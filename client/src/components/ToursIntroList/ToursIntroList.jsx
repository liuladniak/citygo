import TourCard from "../TourCard/TourCard";
import "./ToursIntroList.scss";
import tours from "../../data/data.json";

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
      </div>
    </div>
  );
};

export default ToursIntroList;
