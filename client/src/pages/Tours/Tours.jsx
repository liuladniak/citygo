import TourCard from "../../components/TourCard/TourCard";
import "./Tours.scss";
import tours from "../../data/data.json";

const Tours = () => {
  const landmark = ["center", "neighbourhood"];
  return (
    <section className="tours">
      <div>
        <div className="tours-type">
          <span>Explore / </span>
          <span>All tours</span>
        </div>
        <h1 className="tours-heading">Where would you like to go?</h1>
        <p className="tours-description">
          Discover Istanbul's rich heritage, breathtaking landmarks, and hidden
          gems with our expertly guided tours. Whether you're into history,
          nature, or cuisine, we have a tour for you. Explore iconic sites,
          vibrant neighborhoods, and unique experiences for an unforgettable
          visit. Join us for an immersive journey filled with stories, insights,
          and memorable moments.
        </p>
      </div>

      <div className="tours-wrp">
        <div className="tours-filter">
          <h3 className="tours-filter__heading">Filter</h3>
          <div className="tours-filter-wrp">
            <div>
              <h4>Landmarks</h4>
              <ul>
                {landmark.map((place, i) => {
                  return (
                    <div key={i}>
                      <label htmlFor="landmark">{place}</label>
                      <input type="checkbox" name="landmark" />
                    </div>
                  );
                })}
              </ul>
            </div>
            <div>Price</div>
            <div>Tour type</div>

            <div>Activity Level</div>
          </div>
        </div>

        <div className="tours-list">
          {tours.map((tour, i) => {
            return (
              <TourCard
                key={i}
                tour_name={tour.tour_name}
                id={tour.id}
                tour_thumbnail={tour.tour_thumbnail}
                highlights={tour.highlights}
                duration={tour.duration}
                price={tour.price}
                category={tour.category}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Tours;
