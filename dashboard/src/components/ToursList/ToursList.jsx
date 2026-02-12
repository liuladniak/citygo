import axios from "axios";
import { useEffect, useState } from "react";
import TourListCard from "../TourListCard/TourListCard";
import CountdownLoader from "../CountdownLoader/CountdownLoader";
import Button from "../ui/CustomButton/CustomButton";

const ToursList = () => {
  const API_URL = import.meta.env.VITE_API_KEY;
  const [tours, setTours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const getAllTours = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/tours?page=${currentPage}&limit=${itemsPerPage}`
      );
      setTours(response.data.data);
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
    <section className="max-w-[70]  w-full flex flex-col  mx-4 border-t  border-border-gray">
      <div className="flex w-full justify-between items-center">
        <h1 className="m-4 text-xl font-medium">Tours</h1>
        <Button to="/tours/add" className="bg-brand-teal text-white">
          + Add new tour
        </Button>
      </div>
      <div className="w-full flex flex-wrap justify-between gap-6">
        {tours.length &&
          tours.map((tour) => {
            console.log(tour, "TOURs");
            return (
              <TourListCard
                tour_image={tour.images[0]}
                key={tour.id}
                slug={tour.slug}
                tour_name={tour.tour_name}
                duration={tour.duration}
                price={tour.price}
                category={tour.category}
              />
            );
          })}
      </div>
    </section>
  );
};

export default ToursList;
