import { useState } from "react";
import "./ImageSlider.scss";
import iconLeft from "../../assets/icons/chevron-left-white.svg";
import iconRight from "../../assets/icons/chevron-right-white.svg";

const ImageSlider = ({ images, startIndex }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

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
        src={images[currentIndex]}
        alt={`Slide ${currentIndex}`}
      />
      <div className="slider-button next" onClick={nextSlide}>
        <img src={iconRight} alt="icon right" />
      </div>
    </div>
  );
};

export default ImageSlider;
