// import TourCard from "../TourCard/TourCard";
// import "./ToursIntroList.scss";
// import { Link } from "react-router-dom";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import Icon from "../UI/Icon";
// import ToursSkeletonCard from "../LoadingSceleton/ToursSkeletonCard";
// import { iconChevronLeft, iconChevronRight } from "../UI/iconsPaths";

// const ToursIntroList = () => {
//   const API_URL = import.meta.env.VITE_API_URL;

//   const [tours, setTours] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const SLIDE_COUNT = 3;
//   const [visibleCount, setVisibleCount] = useState(SLIDE_COUNT);

//   useEffect(() => {
//     const getToursData = async () => {
//       try {
//         const response = await axios.get(
//           `${API_URL}/api/tours?page=1&limit=10`
//         );

//         const tours = response.data.data;
//         setTours(tours);
//         setIsLoading(false);
//       } catch (error) {
//         console.error("There was an error fetching the tours data!", error);
//         setIsLoading(false);
//       }
//     };
//     getToursData();
//   }, []);

//   useEffect(() => {
//     const updateCount = () => {
//       setVisibleCount(window.innerWidth < 768 ? 1 : SLIDE_COUNT);
//     };
//     updateCount();
//     window.addEventListener("resize", updateCount);
//     return () => window.removeEventListener("resize", updateCount);
//   }, []);

//   const totalSlides = tours.length;
//   const startIndex = currentSlide;
//   const remainingCards = totalSlides - currentSlide;
//   let selectedTours;

//   if (remainingCards >= visibleCount) {
//     selectedTours = tours.slice(startIndex, startIndex + visibleCount);
//   } else {
//     selectedTours = tours.slice(-visibleCount);
//   }

//   // const handleNext = () => {
//   //   // If we can move forward by a full set, do it
//   //   if (currentSlide + visibleCount < totalSlides) {
//   //     setCurrentSlide((prev) => prev + 1); // Move 1 by 1 for smoother feel on mobile
//   //   }
//   // };

//   // const handlePrev = () => {
//   //   setCurrentSlide((prev) => Math.max(prev - 1, 0));
//   // };

//   const handleNext = () => {
//     // Logic: Don't let the startIndex go beyond (Total - what we can see)
//     setCurrentSlide((prev) => {
//       const nextIndex = prev + 1;
//       if (nextIndex + visibleCount > totalSlides) {
//         return prev; // Stay put if we hit the end
//       }
//       return nextIndex;
//     });
//   };

//   const handlePrev = () => {
//     setCurrentSlide((prev) => Math.max(prev - 1, 0));
//   };

//   return (
//     <div className="tour-intro-list">
//       <h2 className="tour-intro-list__heading">Limited-Time Spotlight</h2>
//       <p className="tour-intro-list__subheading">
//         Every month, we feature a special tour that takes you to some of
//         İstanbul’s coolest spots. Don’t miss out on this chance to explore!
//       </p>
//       <div className="tour-intro-wrp">
//         <div className="tour-info-card">
//           <span className="tour-info-tag">Spotlight Tours</span>
//           <h3 className="tour-info-title">This Month’s Must-See</h3>
//           <p>
//             Each month, we shine the spotlight on a one-of-a-kind journey. This
//             time, it’s all about Historical Fatih! From iconic landmarks to
//             hidden treasures, this tour promises an adventure like no other.
//             Don’t miss your chance to experience it!
//           </p>
//           <Link to="/tours" className="btn--spotlight">
//             View Spotlight Tour →
//           </Link>
//         </div>

//         {isLoading ? (
//           <div className="tour-cards--skeleton">
//             {Array(3)
//               .fill()
//               .map((_, index) => (
//                 <ToursSkeletonCard
//                   key={index}
//                   className="tour-intro-card--skeleton"
//                 />
//               ))}
//           </div>
//         ) : (
//           <div className="tour-slider__wrp">
//             <div className="tour-slider">
//               {selectedTours.map((tour) => (
//                 <TourCard
//                   key={tour.id}
//                   id={tour.id}
//                   tour_name={tour.tour_name}
//                   tour_thumbnail={tour.images[0]}
//                   highlights={tour.highlights}
//                   duration={tour.duration}
//                   price={tour.price}
//                   category={tour.category}
//                   className="tour-intro-card"
//                   images={tour.images}
//                   tourCardImg="tour-intro-img"
//                   featured={tour.featured}
//                   cardWrp="tour-intro-container"
//                 />
//               ))}
//             </div>
//             {currentSlide > 0 && (
//               <button
//                 className="tour-intro-btn tour-intro-btn--prev"
//                 onClick={handlePrev}
//               >
//                 <Icon
//                   iconPath={iconChevronLeft}
//                   className="tour-chevron"
//                   pathClassName="tour-chevron-line"
//                 />
//               </button>
//             )}
//             {currentSlide + SLIDE_COUNT < totalSlides && (
//               <button
//                 className="tour-intro-btn tour-intro-btn--next"
//                 onClick={handleNext}
//               >
//                 <Icon
//                   iconPath={iconChevronRight}
//                   className="tour-chevron"
//                   pathClassName="tour-chevron-line"
//                 />
//               </button>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ToursIntroList;

// ToursIntroList.jsx
import "./ToursIntroList.scss";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import ToursSkeletonCard from "../LoadingSceleton/ToursSkeletonCard";
import AddToFavorites from "../AddToFavorites/AddToFavorites";
import ImageSlider from "../ImageSlider/ImageSlider";
import timeIcon from "../../assets/icons/time-icon-red.png";
import { generateSlug } from "../../utils/generateSlug";

const ToursIntroList = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [tours, setTours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const trackRef = useRef(null);
  const selectedCurrency = useSelector(
    (state) => state.currency.selectedCurrency
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
          `${API_URL}/api/tours?page=1&limit=10`
        );
        const all = response.data.data ?? [];
        // prioritise featured tours, then fill with others
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

  // edge cases
  const isEmpty = !isLoading && tours.length === 0;
  const isSingle = !isLoading && tours.length === 1;

  return (
    <section className="spl">
      <div className="spl__track-wrp">
        {/* prev button */}
        <button
          className="spl__arrow spl__arrow--prev"
          onClick={() => scroll(-1)}
          aria-label="Previous"
        >
          ‹
        </button>

        <div className="spl__track" ref={trackRef}>
          {/* fixed header card — always first */}
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

          {/* tour cards */}
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
                  to={`/tours/${generateSlug(tour.tour_name)}`}
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

        {/* next button */}
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
