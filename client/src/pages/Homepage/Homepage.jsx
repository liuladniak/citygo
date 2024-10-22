import "./Homepage.scss";
import Hero from "../../components/Hero/Hero";
import Map from "../../components/Map/Map";
import MoreServices from "../../components/MoreServices/MoreServices";
import Featured from "../../components/Featured/Featured";
import ToursIntroList from "../../components/ToursIntroList/ToursIntroList";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../utils/api";

const Homepage = () => {
  const [tours, setTours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/tours`);
        setTours(response.data);
      } catch (error) {
        console.error("Error fetching tours data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTours();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Hero />
      <Map tours={tours} />
      <MoreServices />
      <Featured />
      <ToursIntroList />
    </>
  );
};

export default Homepage;
