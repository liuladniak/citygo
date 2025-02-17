import "./Wishlist.scss";
import { useSelector } from "react-redux";
import TourCard from "../../components/TourCard/TourCard";
import { useEffect, useState } from "react";
import Loader from "../../components/UI/Loader";
import axios from "axios";

const Wishlist = () => {
  const favorites = useSelector((state) => state.wishlist.favorites);
  const API_URL = import.meta.env.VITE_API_KEY;
  const [tours, setTours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getWishlistedTours = async () => {
      if (favorites.length === 0) {
        setTours([]);
        setIsLoading(false);
        return;
      }

      try {
        const ids = favorites.map((tour) => tour.id).join(",");
        const response = await axios.get(
          `${API_URL}/api/tours/specific-tours?ids=${ids}`
        );

        setTours(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching wishlisted tours:", error);
        setIsLoading(false);
      }
    };

    getWishlistedTours();
  }, [favorites]);

  if (isLoading) {
    return <Loader />;
  }
  return (
    <div className="wishlist">
      <div className="wishlist-banner">
        <h1 className="wishlist-heading">Wishlist</h1>
      </div>
      {favorites.length > 0 ? (
        <div className="wishlist__grid">
          {tours.map((tour) => (
            <TourCard
              key={tour.id}
              id={tour.id}
              tour_name={tour.tour_name}
              tour_thumbnail={tour.images[0]}
              highlights={tour.highlights}
              duration={tour.duration}
              price={tour.price}
              category={tour.category}
              className="tour-intro-card"
              images={tour.images}
            />
          ))}
        </div>
      ) : (
        <p className="wishlist__empty">
          Your wishlist is empty. Start adding tours!
        </p>
      )}
    </div>
  );
};

export default Wishlist;
