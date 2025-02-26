import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import "./TourCard.scss";
import Button from "../Button/Button";
import timeIcon from "../../assets/icons/time-icon-red.png";
import chevronRightIcon from "../../assets/icons/chevron-right.svg";
import { generateSlug } from "../../utils/generateSlug";
import AddToFavorites from "../AddToFavorites/AddToFavorites";
import ImageSlider from "../ImageSlider/ImageSlider";

// const DISCOUNTED_TOUR_IDS = [1, 2, 4];
const BEST_SELLERS = [2, 5, 9];

const TourCard = ({
  id,
  featured,
  className,
  tour_name,
  tour_thumbnail,
  highlights = [],
  duration,
  price,
  category,
  images = [],
  tourCardImg = "",
  cardWrp = "",
}) => {
  const selectedCurrency = useSelector(
    (state) => state.currency.selectedCurrency
  );
  const exchangeRates = useSelector((state) => state.currency.exchangeRates);

  const API_URL = import.meta.env.VITE_API_KEY;
  const highlightsList = highlights.join(", ");

  const convertPrice = (price) => {
    if (selectedCurrency === "USD") return price;
    const rate = exchangeRates[selectedCurrency.toLowerCase()];

    if (!rate) {
      console.error(`No exchange rate found for ${selectedCurrency}`);
      return price;
    }
    return Math.round(price * rate);
  };

  const getCategoryClass = (category) => {
    switch (category) {
      case "Guided tour":
        return "guided-tour";
      case "Culinary tour":
        return "culinary-tour";
      case "Experience":
        return "experience";
      default:
        return "";
    }
  };

  // const isDiscounted = DISCOUNTED_TOUR_IDS.includes(id);
  const discountedPrice = featured
    ? Math.round(convertPrice(price) * 0.9)
    : null;
  const isBestSeller = BEST_SELLERS.includes(id);

  return (
    <Link
      className={`tour-card ${className}`}
      to={`/tours/${generateSlug(tour_name)}`}
    >
      {isBestSeller && (
        <div className="tour-card__best-seller">Best Seller</div>
      )}

      <div className="tour-card-container">
        <div className={`tour-card__img-wrp ${tourCardImg}`}>
          {images.length > 0 ? (
            <ImageSlider images={images} startIndex={0} />
          ) : (
            <div>No images available</div>
          )}
        </div>

        <div className="tour-card__content ">
          <h3 className="tour-card__heading">{tour_name}</h3>
          <div className="tour-card__tags">
            <div className="tour-card__duration">
              <div className="tour-card__duration-icon">
                <img src={timeIcon} alt="icon time" />
              </div>
              <h5 className="tour-card__duration-hour">{duration}</h5>
            </div>
            <div
              className={`tour-card__category ${getCategoryClass(category)}`}
            >
              {category}
            </div>
          </div>
          <div className="tour-card__highlights">
            <p className="tour-card__highlights-list">{highlightsList}</p>
          </div>
          <div className="tour-card__price">
            {featured ? (
              <div className="tour-card__price-discount">
                {" "}
                <span className="tour-card__price-number">From</span>
                <span className="tour-card__price-old">
                  {convertPrice(price)} {selectedCurrency}
                </span>{" "}
                <span className="tour-card__price-new">
                  {discountedPrice} {selectedCurrency} 🔥
                </span>
              </div>
            ) : (
              <h5 className="tour-card__price-number">
                From {convertPrice(price)} {selectedCurrency}
              </h5>
            )}
          </div>
          <Button
            className="btn btn--view-details"
            iconUrl={chevronRightIcon}
            text="View tour"
          />
        </div>
      </div>
      <div className="tour-card__favorite" aria-label="Add to favorites">
        <AddToFavorites
          tour={{ id, tour_name, tour_thumbnail, duration, price }}
        />
      </div>
    </Link>
  );
};

export default TourCard;
