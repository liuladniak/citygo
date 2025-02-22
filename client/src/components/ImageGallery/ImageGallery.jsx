import { useState, useEffect } from "react";
import "./ImageGallery.scss";
import iconLeft from "../../assets/icons/chevron-left-white.svg";
import iconRight from "../../assets/icons/chevron-right-white.svg";

const ImageGallery = ({ images, startIndex }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const API_URL = import.meta.env.VITE_API_KEY;

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight") {
        nextSlide();
      } else if (event.key === "ArrowLeft") {
        prevSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [images.length]);

  return (
    <div className="image-slider">
      <div className="slider-button prev" onClick={prevSlide}>
        <img src={iconLeft} alt="icon left" />
      </div>
      <img
        className="slider-image"
        src={`${API_URL}/${images[currentIndex]}`}
        alt={`Slide ${currentIndex}`}
      />
      <div className="slider-button next" onClick={nextSlide}>
        <img src={iconRight} alt="icon right" />
      </div>
    </div>
  );
};

export default ImageGallery;
