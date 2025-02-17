import { useState } from "react";
import "./ImageGallery.scss";
import iconLeft from "../../assets/icons/chevron-left-white.svg";
import iconRight from "../../assets/icons/chevron-right-white.svg";

const ImageGallery = ({ images, startIndex }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const API_URL = import.meta.env.VITE_API_KEY;
  const nextSlide = () => {
    const newIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(newIndex);
  };

  const prevSlide = () => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

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
