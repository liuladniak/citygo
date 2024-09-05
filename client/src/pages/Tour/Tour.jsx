import axios from "axios";
import { API_URL } from "../../utils/api";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Tour.scss";
import BookingForm from "../../components/BookingForm/BookingForm";
import Map from "../../components/Map/Map";
import WhyUs from "../../components/WhyUs/WhyUs";
import saveIcon from "../../assets/icons/heart.svg";
import shareIcon from "../../assets/icons/share.svg";
import checkIcon from "../../assets/icons/check.svg";
import ImageSlider from "../../components/ImageSlider/ImageSlider";
import Modal from "../../components/Modal/Modal";
import timeIcon from "../../assets/icons/icon-time.svg";
import { formatPrice } from "../../utils/formatPrice";

const Tour = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [tour, setTour] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { id } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const getOneTour = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/tours/${id}`);
        setTour(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("There was an error fetching the tour data", error);
        setIsLoading(false);
      }
    };
    getOneTour();
  }, [id]);

  const openModal = (index) => {
    setSelectedImageIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const {
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
    available_dates,
    longitude,
    latitude,
    images,
  } = tour;

  if (isLoading) {
    return <div>Loading...</div>;
  }

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

            <div className="tour-content">
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
                      <h4>Price</h4>
                      <div className="tour-duration-price">
                        <p>USD {formatPrice(price)}</p>
                      </div>
                    </div>
                    <div className="tour-duration">
                      <h4>Activity Level</h4>
                      <div className="tour-duration-price">
                        <p>{activity_level}</p>
                      </div>
                    </div>
                  </div>
                  <div className="tour-tags--r">
                    <div className="tour-tags-wrp">
                      <img src={saveIcon} alt="heart icon" />
                      <h5 className="tour-tags--r-heading">Save to wishlist</h5>
                    </div>
                    <div className="tour-tags-wrp">
                      <img src={shareIcon} alt="share icon" />
                      <h5 className="tour-tags--r-heading">Share</h5>
                    </div>
                  </div>
                </div>
              </div>
              <div className="tour-hero__img-wrp">
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
            </div>
          </div>

          <Modal isOpen={modalOpen} onClose={closeModal}>
            <ImageSlider
              images={images.map((image) => `${API_URL}/${image}`)}
              startIndex={selectedImageIndex}
            />
          </Modal>
          <div className="tour-details-wrp">
            <div className="tour-details">
              <div className="tour-overview">
                <h4 className="tour-overview-heading">{overview_title}</h4>
                <p className="tour-overview-content">{overview}</p>
              </div>

              <div className="tour-highlights">
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

              <div className="tour-summary">
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

                <Map
                  longitude={longitude}
                  latitude={latitude}
                  popupText="Meeting point"
                />
              </div>
            </div>

            <div className="tour-summary__dates">
              <BookingForm available_dates={available_dates} />
            </div>
          </div>
        </div>
      </section>

      <WhyUs />
    </>
  );
};

export default Tour;
