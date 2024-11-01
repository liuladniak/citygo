import axios from "axios";
import "./TourDetails.scss";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const TourDetails = () => {
  const API_URL = import.meta.env.VITE_API_KEY;
  const { slug } = useParams();
  const [tour, setTour] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getOneTour = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/tours/${slug}`);
        console.log(response.data, "response data:");
        setTour(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("There was an error fetching the tour data", error);
        setIsLoading(false);
      }
    };
    getOneTour();
  }, [slug]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <section>
      <div>
        <div>go back</div>
        <div>
          <h3>Tour</h3>
          <div>{tour.tour_name}</div>
        </div>
      </div>
      gallery
    </section>
  );
};

export default TourDetails;
