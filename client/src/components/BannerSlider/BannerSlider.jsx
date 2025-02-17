import { useState, useRef, useEffect } from "react";
import "./BannerSlider.scss";

const BannerSlider = ({ articles }) => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const sliderRef = useRef(null);
  const intervalRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_KEY;
  console.log("banner images", articles);
  const slides = [articles[articles.length - 1], ...articles, articles[0]];

  console.log("BannerSlider component mounted");

  const startAutoplay = () => {
    stopAutoplay();
    intervalRef.current = setInterval(() => {
      handleNext();
    }, 3000);
  };

  const stopAutoplay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const resetAutoplay = () => {
    stopAutoplay();
    startAutoplay();
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  const handleDotClick = (index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index + 1);
    resetAutoplay();
  };

  useEffect(() => {
    const sliderElement = sliderRef.current;

    const handleTransitionEnd = () => {
      setIsTransitioning(false);

      if (currentIndex === 0) {
        sliderElement.style.transition = "none";
        setCurrentIndex(articles.length);
      } else if (currentIndex === slides.length - 1) {
        sliderElement.style.transition = "none";
        setCurrentIndex(1);
      }
    };

    sliderElement.addEventListener("transitionend", handleTransitionEnd);

    return () => {
      sliderElement.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, [currentIndex, articles.length, slides.length]);

  useEffect(() => {
    const sliderElement = sliderRef.current;

    if (sliderElement) {
      sliderElement.style.transition = isTransitioning
        ? "transform 0.5s ease-in-out"
        : "none";
      sliderElement.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
  }, [currentIndex, isTransitioning]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        startAutoplay();
      } else {
        stopAutoplay();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    startAutoplay();

    return () => {
      stopAutoplay();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div className="banner-slider">
      <div className="slider-container">
        <div className="slider-track" ref={sliderRef}>
          {slides.map((article, index) => (
            <article key={index} className="slider-card">
              <div className="slider-card__wrp">
                <img
                  src={`${API_URL}/articles/${article.images[0]}`}
                  alt={`Slide ${index}`}
                  className="slider-image"
                />
              </div>
              <div className="text-overlay">
                <h2>{article.title}</h2>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="slider-dots">
        {articles.map((_, index) => (
          <button
            key={index}
            className={`dot ${
              currentIndex === index + 1 ||
              (currentIndex === 0 && index === articles.length - 1) ||
              (currentIndex === slides.length - 1 && index === 0)
                ? "active"
                : ""
            }`}
            onClick={() => handleDotClick(index)}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default BannerSlider;
