import axios from "axios";
import { useEffect, useState } from "react";
import "./ToursList.scss";
import TourListCard from "../TourListCard/TourListCard";
import CountdownLoader from "../CountdownLoader/CountdownLoader";

const ToursList = () => {
  const API_URL = import.meta.env.VITE_API_KEY;
  const [tours, setTours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getAllTours = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tours`);
      setTours(response.data);
      console.log(response.data, "response");
      setIsLoading(false);
    } catch (error) {
      console.error("Error getting all tours");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllTours();
  }, []);

  if (isLoading) {
    return <CountdownLoader />;
  }

  return (
    <section className="tour-list">
      {tours.length &&
        tours.map((tour) => {
          console.log(tour, "TOURs");
          return (
            <TourListCard
              key={tour.id}
              slug={tour.slug}
              tour_name={tour.tour_name}
              duration={tour.duration}
              price={tour.price}
            />
          );
        })}
    </section>
  );
};

export default ToursList;
