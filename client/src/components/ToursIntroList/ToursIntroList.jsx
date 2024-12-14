import TourCard from "../TourCard/TourCard";
import "./ToursIntroList.scss";
import arrowRightIcon from "../../assets/icons/chevron-right.svg";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import CountdownLoader from "../CountdownLoader/CountdownLoader";
import Loader from "../UI/Loader";

const ToursIntroList = () => {
  const API_URL = import.meta.env.VITE_API_KEY;

  const [tours, setTours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const selectedTours = tours.slice(0, 3);

  useEffect(() => {
    const getToursData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/tours`);
        const tours = response.data;
        setTours(tours);
        setIsLoading(false);
      } catch (error) {
        console.error("There was an error fetching the tours data!", error);
        setIsLoading(false);
      }
    };
    getToursData();
  }, []);

  // if (isLoading) {
  //   return <CountdownLoader />;
  // }

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="tour-intro-list">
      <h2 className="tour-intro-list__heading">View our tours</h2>
      <div className="tour-intro-wrp">
        {selectedTours.map((tour) => (
          <TourCard
            key={tour.id}
            id={tour.id}
            tour_name={tour.tour_name}
            tour_thumbnail={tour.images[0]}
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
