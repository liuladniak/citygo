import TourCard from "../TourCard/TourCard";
import "./ToursIntroList.scss";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Icon from "../UI/Icon";
import ToursSkeletonCard from "../LoadingSceleton/ToursSkeletonCard";
import { iconChevronLeft, iconChevronRight } from "../UI/iconsPaths";

const ToursIntroList = () => {
  const API_URL = import.meta.env.VITE_API_KEY;

  const [tours, setTours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const SLIDE_COUNT = 3;

  useEffect(() => {
    const getToursData = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/tours?page=1&limit=10`
        );

        const tours = response.data.data;
        console.log(tours, "TOURS INTRO*****");
        setTours(tours);
        setIsLoading(false);
      } catch (error) {
        console.error("There was an error fetching the tours data!", error);
        setIsLoading(false);
      }
    };
    getToursData();
  }, []);

  const totalSlides = tours.length;
  const startIndex = currentSlide;
  const remainingCards = totalSlides - currentSlide;
  let selectedTours;

  if (remainingCards >= SLIDE_COUNT) {
    selectedTours = tours.slice(startIndex, startIndex + SLIDE_COUNT);
  } else {
    selectedTours = tours.slice(-SLIDE_COUNT);
  }

  const handleNext = () => {
    if (remainingCards > SLIDE_COUNT) {
      setCurrentSlide((prev) => prev + SLIDE_COUNT);
    } else {
      setCurrentSlide(totalSlides - SLIDE_COUNT);
    }
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => Math.max(prev - SLIDE_COUNT, 0));
  };

  return (
    <div className="tour-intro-list">
      <h2 className="tour-intro-list__heading">Limited-Time Spotlight</h2>
      <p className="tour-intro-list__subheading">
        Every month, we feature a special tour that takes you to some of
        İstanbul’s coolest spots. Don’t miss out on this chance to explore!
      </p>
      <div className="tour-intro-wrp">
        <div className="tour-info-card">
          <span className="tour-info-tag">Spotlight Tours</span>
          <h3 className="tour-info-title">This Month’s Must-See</h3>
          <p>
            Each month, we shine the spotlight on a one-of-a-kind journey. This
            time, it’s all about Historical Fatih! From iconic landmarks to
            hidden treasures, this tour promises an adventure like no other.
            Don’t miss your chance to experience it!
          </p>
          <Link to="/tours" className="btn--spotlight">
            View Spotlight Tour →
          </Link>
        </div>

        {isLoading ? (
          <div className="tour-cards--skeleton">
            {Array(3)
              .fill()
              .map((_, index) => (
                <ToursSkeletonCard
                  key={index}
                  className="tour-intro-card--skeleton"
                />
              ))}
          </div>
        ) : (
          <div className="tour-slider__wrp">
            <div className="tour-slider">
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
                  className="tour-intro-card"
                  images={tour.images}
                  tourCardImg="tour-intro-img"
                  cardWrp="tour-intro-container"
                />
              ))}
            </div>
            {currentSlide > 0 && (
              <button
                className="tour-intro-btn tour-intro-btn--prev"
                onClick={handlePrev}
              >
                <Icon
                  iconPath={iconChevronLeft}
                  className="tour-chevron"
                  pathClassName="tour-chevron-line"
                />
              </button>
            )}
            {currentSlide + SLIDE_COUNT < totalSlides && (
              <button
                className="tour-intro-btn tour-intro-btn--next"
                onClick={handleNext}
              >
                <Icon
                  iconPath={iconChevronRight}
                  className="tour-chevron"
                  pathClassName="tour-chevron-line"
                />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ToursIntroList;
