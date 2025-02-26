import axios from "axios";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./Tour.scss";
import BookingForm from "../../components/BookingForm/BookingForm";
import Map from "../../components/Map/Map";
import WhyUs from "../../components/WhyUs/WhyUs";
import saveIcon from "../../assets/icons/heart.svg";
import saveIconFilled from "../../assets/icons/heart-red-filled.svg";
import shareIcon from "../../assets/icons/share.svg";
import checkIcon from "../../assets/icons/check.svg";
import Modal from "../../components/Modal/Modal";
import timeIcon from "../../assets/icons/icon-time.svg";
import {
  addFavorite,
  removeFavorite,
} from "../../features/wishlist/wishlistSlice";
import ImageGallery from "../../components/ImageGallery/ImageGallery";
import SkeletonTour from "../../components/LoadingSceleton/SkeletonTour";

const Tour = () => {
  const dispatch = useDispatch();

  const API_URL = import.meta.env.VITE_API_KEY;
  const selectedCurrency = useSelector(
    (state) => state.currency.selectedCurrency
  );
  const exchangeRates = useSelector((state) => state.currency.exchangeRates);
  const [isLoading, setIsLoading] = useState(true);
  const [tour, setTour] = useState({});
  const [copyStatus, setCopyStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { slug } = useParams();

  const convertPrice = (price) => {
    if (selectedCurrency === "USD") return price;
    const rate = exchangeRates[selectedCurrency.toLowerCase()];
    if (!rate) {
      console.error(`No exchange rate found for ${selectedCurrency}`);
      return price;
    }
    return Math.round(price * rate);
  };

  const handleShareClick = async () => {
    const shareUrl = `${window.location.origin}/tours/${slug}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus("Link copied!");
      setTimeout(() => setCopyStatus(""), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const favorites = useSelector((state) => state.wishlist.favorites);

  const isLiked = favorites.some((favorite) => favorite.id === tour.id);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiked) {
      dispatch(removeFavorite(tour.id));
    } else {
      dispatch(addFavorite(tour));
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const getOneTour = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/tours/${slug}`);
        setTour(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("There was an error fetching the tour data", error);
        setIsLoading(false);
      }
    };
    getOneTour();
  }, [slug]);

  const openModal = (index) => {
    setSelectedImageIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const navRef = useRef(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!navRef.current) return;
      const navTop = navRef.current.offsetTop;
      const scrollY = window.scrollY;

      if (scrollY >= navTop) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      window.scrollTo({
        top:
          targetElement.offsetTop -
          (isSticky ? navRef.current.offsetHeight : 0),
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return <SkeletonTour />;
  }

  const {
    id,
    tour_name,
    duration,
    price,
    activity_level,
    overview_title,
    overview,
    essentials,
    includes,
    highlights,
    accessibility,
    groups,
    minimum_of_attendees,
    additional_costs,
    featured,
    tour_itinerary_coordinates,
    tour_time_slots,
    images,
    available_end_date,
    unavailable_recurring_day_of_week,
    unavailable_dates,
    available_start_date,
  } = tour;

  console.log("Tour", tour);

  const discountedPrice = featured
    ? Math.round(convertPrice(price) * 0.9)
    : null;

  const mainImage = images[0];
  const additionalImages = images.slice(1, 4);

  return (
    <>
      <section className="tour">
        <div className="tour-wrp">
          <div className="tour-hero">
            <div className="tour__img-main">
              <img
                src={`${API_URL}/${mainImage}`}
                alt="tour image"
                onClick={() => openModal(0)}
              />
            </div>

            <div className="tour-text">
              <h1 className="tour__heading">{tour_name}</h1>
              <div className="tour-tags">
                <div className="tour-tags--l">
                  <div className="tour-duration">
                    <h4 className="tour-duration__title">Duration</h4>
                    <div className="tour-duration-time">
                      <img src={timeIcon} alt="icon clock" />
                      <p className="tour-duration__hour">{duration}</p>
                    </div>
                  </div>
                  <div className="tour-duration">
                    <h4 className="tour-duration__title">Price</h4>
                    <div className="tour-duration-price">
                      <div className="tour-card__price">
                        {featured ? (
                          <div className="tour-card__price-discount">
                            {" "}
                            <span className="tour-card__price-number">
                              From
                            </span>
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
                    </div>
                  </div>
                  <div className="tour-duration">
                    <h4 className="tour-duration__title">Activity Level</h4>
                    <div className="tour-duration-price">
                      <p>{activity_level}</p>
                    </div>
                  </div>
                </div>
                <div className="tour-tags--r">
                  <div
                    className="tour-tags-wrp tour__save"
                    onClick={handleClick}
                  >
                    <div className="heart-container">
                      <img
                        src={saveIcon}
                        alt="heart outline icon"
                        className={`heart-icon ${isLiked ? "hidden" : ""}`}
                      />
                      <img
                        src={saveIconFilled}
                        alt="Liked"
                        className={`heart-icon ${
                          isLiked ? "visible" : "hidden"
                        }`}
                      />
                    </div>
                    <h5 className="tour-tags--r-heading">
                      {" "}
                      {isLiked ? "Saved to wishlist" : "Save to wishlist"}
                    </h5>
                  </div>
                  <div
                    className="tour-tags-wrp tour__share"
                    onClick={handleShareClick}
                  >
                    <img src={shareIcon} alt="share icon" />
                    <h5 className="tour-tags--r-heading">Share</h5>
                    {copyStatus && <p className="copy-status">{copyStatus}</p>}
                  </div>
                </div>
              </div>
            </div>

            {additionalImages.map((image, index) => (
              <div className="tour-hero__img-link" key={index}>
                <img
                  src={`${API_URL}/${image}`}
                  alt={`tour image ${index}`}
                  onClick={() => openModal(index + 1)}
                />
              </div>
            ))}
          </div>

          <div ref={navRef} className={`tour-nav ${isSticky ? "sticky" : ""}`}>
            <ul className="tour-nav__list">
              <li className="tour-nav__item">
                <a
                  href="#overview"
                  onClick={(e) => handleNavClick(e, "overview")}
                >
                  Overview
                </a>
              </li>
              <li className="tour-nav__item">
                <a
                  href="#highlights"
                  onClick={(e) => handleNavClick(e, "highlights")}
                >
                  Highlights
                </a>
              </li>
              <li className="tour-nav__item">
                <a
                  href="#details"
                  onClick={(e) => handleNavClick(e, "details")}
                >
                  Details
                </a>
              </li>
              <li className="tour-nav__item">
                <a href="#map" onClick={(e) => handleNavClick(e, "map")}>
                  Map
                </a>
              </li>
            </ul>
          </div>

          <Modal isOpen={modalOpen} onClose={closeModal} className="tour-modal">
            <ImageGallery images={images} startIndex={selectedImageIndex} />
          </Modal>

          <div className="tour-details-wrp">
            <div className="tour-details " id="overview">
              <div className="tour-overview">
                <h4 className="tour-overview-heading">{overview_title}</h4>
                <p className="tour-overview-content">{overview}</p>
              </div>

              <div className="tour-highlights" id="highlights">
                <h4 className="tour-details__heading">Highlights</h4>
                <ul className="tour-highlights__list">
                  {highlights.map((item, i) => {
                    return (
                      <li key={i} className="tour-highlights__item">
                        <img src={checkIcon} alt="check icon" />
                        <span>{item}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="tour-summary" id="details">
                <h3 className="tour-details__heading">What should you know?</h3>
                <div className="tour-el">
                  <h4 className="tour-el__title">Includes</h4>
                  <p className="tour-el__content">{includes}</p>
                </div>

                <div className="tour-el">
                  <h4 className="tour-el__title">Essentials</h4>
                  <div className="tour-el__content">{essentials}</div>
                </div>
                <div className="tour-el">
                  <h4 className="tour-el__title">Accessibility</h4>
                  <p className="tour-el__content">{accessibility}</p>
                </div>
                <div className="tour-el">
                  <h4 className="tour-el__title">Group size</h4>
                  <p className="tour-el__content">
                    Accepts reservations up to {groups} people.
                  </p>
                </div>
                <div className="tour-el">
                  <h4 className="tour-el__title">Minimum of attendees</h4>
                  <p className="tour-el__content">
                    A minimum of {minimum_of_attendees} people is required for
                    the tour.
                  </p>
                </div>
                <div className="tour-el">
                  <h4 className="tour-el__title">Additional Costs</h4>
                  <p className="tour-el__content">{additional_costs}</p>
                </div>

                <Map id="map" itinerary={tour_itinerary_coordinates} />
              </div>
            </div>

            <div className="tour-summary__dates">
              <BookingForm
                price={price}
                slug={slug}
                tour_id={id}
                availableEndDate={available_end_date}
                availableStartDate={available_start_date}
                title={tour_name}
                mainImage={mainImage}
                unavailableRecurringDays={unavailable_recurring_day_of_week}
                unavailableDates={unavailable_dates}
                tour_time_slots={tour_time_slots}
                featured={featured}
              />
            </div>
          </div>
        </div>
      </section>

      <WhyUs />
    </>
  );
};

export default Tour;
