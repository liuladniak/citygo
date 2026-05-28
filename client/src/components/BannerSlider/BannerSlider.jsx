import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./BannerSlider.scss";

const BannerSlider = ({ articles }) => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const sliderRef = useRef(null);
  const intervalRef = useRef(null);

  const slides = [articles[articles.length - 1], ...articles, articles[0]];

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
    setCurrentIndex((prev) => prev + 1);
  };

  const handleDotClick = (index, e) => {
    e.stopPropagation();
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
    return () =>
      sliderElement.removeEventListener("transitionend", handleTransitionEnd);
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
            <Link
              key={index}
              to={`/article/${article.slug}`}
              className="slider-card"
            >
              <div className="slider-card__wrp">
                <img
                  src={article.images[0]?.url}
                  alt={article.title}
                  className="slider-image"
                />
              </div>
              <div className="text-overlay">
                <h2>{article.title}</h2>
              </div>
            </Link>
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
            onClick={(e) => handleDotClick(index, e)}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerSlider;
