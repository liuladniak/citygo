import axios from "axios";
import { API_URL } from "../../utils/api";
// import tours from "../../data/data.json";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Tour.scss";
import BookingForm from "../../components/BookingForm/BookingForm";
import Map from "../../components/Map/Map";
import WhyUs from "../../components/WhyUs/WhyUs";
import saveIcon from "../../assets/icons/heart.svg";
import saveFilledIcon from "../../assets/icons/heart-filled.svg";
import shareIcon from "../../assets/icons/share.svg";
import checkIcon from "../../assets/icons/check.svg";

const Tour = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [tour, setTour] = useState({});
  const { id } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const getOneTour = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/tours/${id}`);
        console.log("TOUR DATA:", response.data);
        setTour(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("There was an error fetching the tour data", error);
        setIsLoading(false);
      }
    };
    getOneTour();
  }, [id]);

  // const tour = tours.find((tour) => tour.id.toString() === id);

  const {
    tour_name,
    tour_thumbnail,
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
    category,
  } = tour;

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <section className="tour">
        <div className="tour-wrp">
          <div className="tour-hero">
            <div className="tour__img-main">
              <img src={tour_thumbnail} alt="tour image" />
            </div>
            <div className="tour-content">
              <div className="tour-text">
                <h1 className="tour__heading">{tour_name}</h1>
                <div className="tour-tags">
                  <div className="tour-tags--l">
                    <div className="tour-duration">
                      <h4 className="tour-duration__title">Duration</h4>
                      <span className="tour-duration__hour">{duration}</span>
                    </div>
                    <div className="tour-duration">
                      <h4>Price</h4>
                      <span>USD {price}</span>
                    </div>
                    <div className="tour-duration">
                      <h4>Activity Level</h4>
                      <span>{activity_level}</span>
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
                <div className="tour-hero__img"></div>
                <div className="tour-hero__img"></div>
                <div className="tour-hero__img"></div>
              </div>
            </div>
          </div>

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
                  className="map-tour"
                  longitude={longitude}
                  latitude={latitude}
                  popupText="Meeting point"
                  category={category}
                />
              </div>
              <WhyUs />
            </div>
            <BookingForm available_dates={available_dates} />
          </div>
        </div>
      </section>
    </>
  );
};

export default Tour;
