import { useState } from "react";
import "./ImageSlider.scss";
import iconLeft from "../../assets/icons/chevron-left-white.svg";
import iconRight from "../../assets/icons/chevron-right-white.svg";

const ImageSlider = ({ videos, startIndex, className }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const API_URL = import.meta.env.VITE_API_KEY;
  const nextSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(newIndex);
  };

  const prevSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  return (
    <div className={`image-slider image-slider--card ${className}`}>
      <img
        className="slider-image"
        src={`${API_URL}/${images[currentIndex]}`}
        alt=""
      />
      <div className="slider-buttons slider-buttons__card">
        <div
          className="slider-button prev slider-button__card--prev"
          onClick={prevSlide}
        >
          <img src={iconLeft} alt="icon left" />
        </div>
        <span className="images-count">{`${currentIndex + 1}/${
          images.length
        }`}</span>
        <div
          className="slider-button next  slider-button__card--next"
          onClick={nextSlide}
        >
          <img src={iconRight} alt="icon right" />
        </div>
      </div>
    </div>
  );
};

export default ImageSlider;
