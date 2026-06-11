import "./ToursIntroList.scss";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import ToursSkeletonCard from "../LoadingSceleton/ToursSkeletonCard";
import AddToFavorites from "../AddToFavorites/AddToFavorites";
import ImageSlider from "../ImageSlider/ImageSlider";
import timeIcon from "../../assets/icons/time-icon-red.png";
import StarRating from "../StarRating/StarRating";

const ToursIntroList = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [tours, setTours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const trackRef = useRef(null);
  const selectedCurrency = useSelector(
    (state) => state.currency.selectedCurrency,
  );
  const exchangeRates = useSelector((state) => state.currency.exchangeRates);

  const convertPrice = (price) => {
    if (selectedCurrency === "USD") return price;
    const rate = exchangeRates[selectedCurrency.toLowerCase()];
    if (!rate) return price;
    return Math.round(price * rate);
  };

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/tours?page=1&limit=10`,
        );
        const all = response.data.data ?? [];

        const featured = all.filter((t) => t.featured);
        const rest = all.filter((t) => !t.featured);
        setTours([...featured, ...rest]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTours();
  }, []);

  const scroll = (dir) => {
    if (!trackRef.current) return;
    const card = trackRef.current.querySelector(".spl-tour-card");
    const cardWidth = card ? card.offsetWidth + 16 : 320;
    trackRef.current.scrollBy({ left: dir * cardWidth, behavior: "smooth" });
  };

  const isEmpty = !isLoading && tours.length === 0;
  const isSingle = !isLoading && tours.length === 1;

  return (
    <section className="spl">
      <div className="spl__track-wrp">
        <button
          className="spl__arrow spl__arrow--prev"
          onClick={() => scroll(-1)}
          aria-label="Previous"
        >
          ‹
        </button>

        <div className="spl__track" ref={trackRef}>
          <div className="spl-header-card">
            <span className="spl-header-card__label">Spotlight Tours</span>
            <h2 className="spl-header-card__heading">
              {isEmpty
                ? "Our Tours"
                : isSingle
                  ? "This Month's Pick"
                  : "Limited-Time Spotlight"}
            </h2>
            <p className="spl-header-card__desc">
              {isEmpty
                ? "We're preparing new featured tours. Check back soon."
                : "Hand-picked experiences for this month. Don't miss your chance to explore Istanbul like never before."}
            </p>
            {!isEmpty && (
              <Link to="/tours" className="spl-header-card__cta">
                View all tours →
              </Link>
            )}
          </div>

          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="spl-tour-card spl-tour-card--skeleton">
                  <ToursSkeletonCard />
                </div>
              ))}
            </>
          ) : isEmpty ? (
            <div className="spl-empty">
              <p>No spotlight tours available right now.</p>
              <Link to="/tours" className="spl-header-card__cta">
                Browse all tours
              </Link>
            </div>
          ) : (
            tours.map((tour) => {
              const discountedPrice = tour.featured
                ? Math.round(convertPrice(tour.price) * 0.9)
                : null;

              return (
                <Link
                  key={tour.id}
                  to={`/tours/${tour.slug}`}
                  className="spl-tour-card"
                >
                  {tour.featured && (
                    <div className="spl-tour-card__badge">Featured</div>
                  )}
                  <div className="spl-tour-card__img">
                    {tour.images?.length > 0 ? (
                      <ImageSlider images={tour.images} startIndex={0} />
                    ) : (
                      <div className="spl-tour-card__no-img">No image</div>
                    )}
                  </div>

                  <div className="spl-tour-card__body">
                    <h3 className="spl-tour-card__name">{tour.tour_name}</h3>
                    {tour.avg_rating && (
                      <div className="spl-tour-card__rating">
                        <StarRating
                          rating={parseFloat(tour.avg_rating)}
                          mode="display"
                          size="sm"
                        />
                        <span className="spl-tour-card__rating-avg">
                          {tour.avg_rating}
                        </span>
                        <span className="spl-tour-card__rating-count">
                          ({tour.review_count})
                        </span>
                      </div>
                    )}
                    <div className="spl-tour-card__tags">
                      <div className="spl-tour-card__duration">
                        <img src={timeIcon} alt="duration" />
                        <span>{tour.duration}</span>
                      </div>
                      <span
                        className={`spl-tour-card__category spl-tour-card__category--${tour.category
                          ?.toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {tour.category}
                      </span>
                    </div>

                    {tour.highlights?.length > 0 && (
                      <p className="spl-tour-card__highlights">
                        {tour.highlights.slice(0, 3).join(", ")}
                      </p>
                    )}

                    <div className="spl-tour-card__price">
                      {tour.featured ? (
                        <>
                          <span className="spl-tour-card__price--old">
                            From {convertPrice(tour.price)} {selectedCurrency}
                          </span>
                          <span className="spl-tour-card__price--new">
                            {discountedPrice} {selectedCurrency} 🔥
                          </span>
                        </>
                      ) : (
                        <span className="spl-tour-card__price--regular">
                          From {convertPrice(tour.price)} {selectedCurrency}
                        </span>
                      )}
                    </div>

                    <span className="spl-tour-card__btn">
                      View tour &rsaquo;
                    </span>
                  </div>

                  <div
                    className="spl-tour-card__fav"
                    onClick={(e) => e.preventDefault()}
                  >
                    <AddToFavorites
                      tour={{
                        id: tour.id,
                        tour_name: tour.tour_name,
                        tour_thumbnail: tour.images?.[0],
                        duration: tour.duration,
                        price: tour.price,
                      }}
                    />
                  </div>
                </Link>
              );
            })
          )}
        </div>

        <button
          className="spl__arrow spl__arrow--next"
          onClick={() => scroll(1)}
          aria-label="Next"
        >
          ›
        </button>
      </div>
    </section>
  );
};

export default ToursIntroList;
