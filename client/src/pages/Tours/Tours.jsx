import axios from "axios";
import { useEffect, useState } from "react";
import { API_URL } from "../../utils/api";
import { useLocation } from "react-router-dom";
import TourCard from "../../components/TourCard/TourCard";
import "./Tours.scss";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const Tours = () => {
  const [tours, setTours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const query = useQuery();
  const initialCategory = query.get("category") || "";
  const [selectedLandmark, setSelectedLandmark] = useState("");
  const [selectedTourType, setSelectedTourType] = useState(initialCategory);
  const [selectedActivityLevel, setSelectedActivityLevel] = useState("");
  const [selectedSort, setSelectedSort] = useState("");

  useEffect(() => {
    const getToursData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/tours`);
        const tours = response.data;
        console.log(tours);
        setTours(tours);
        setIsLoading(false);
      } catch (error) {
        console.log(error.message);
        console.error("There was an error fetching the tours data!", error);
        setIsLoading(false);
      }
    };
    getToursData();
  }, []);

  const landmarkOptions = ["center", "neighborhood"];
  const tourTypeOptions = ["Guided tour", "Culinary tour", "Experience"];
  const activityLevelOptions = ["Easy", "Moderate", "Hard"];
  const sortOptions = ["Lower price first", "Higher price first"];

  const handleFilterChange = (setter) => (event) => {
    setter(event.target.value);
  };

  const filterTours = (tours) => {
    return tours.filter((tour) => {
      const matchesLandmark =
        !selectedLandmark || tour.landmarks === selectedLandmark;
      const matchesTourType =
        !selectedTourType || tour.category === selectedTourType;
      const matchesActivityLevel =
        !selectedActivityLevel || tour.activity_level === selectedActivityLevel;

      const matches =
        matchesLandmark && matchesTourType && matchesActivityLevel;

      return matches;
    });
  };

  const sortTours = (tours) => {
    return [...tours].sort((a, b) => {
      if (selectedSort === "Lower price first") {
        return a.price - b.price;
      } else if (selectedSort === "Higher price first") {
        return b.price - a.price;
      }
      return 0;
    });
  };

  const filteredAndSortedTours = sortTours(filterTours(tours));

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
              <select
                className="tours-filter__select"
                value={selectedLandmark}
                onChange={handleFilterChange(setSelectedLandmark)}
              >
                <option value="">Select Landmark</option>
                {landmarkOptions.map((option, i) => (
                  <option key={i} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                className="tours-filter__select"
                value={selectedTourType}
                onChange={handleFilterChange(setSelectedTourType)}
              >
                <option value="">Select Tour Type</option>
                {tourTypeOptions.map((option, i) => (
                  <option key={i} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                className="tours-filter__select"
                value={selectedActivityLevel}
                onChange={handleFilterChange(setSelectedActivityLevel)}
              >
                <option value="">Select Activity Level</option>
                {activityLevelOptions.map((option, i) => (
                  <option key={i} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                className="tours-filter__select"
                value={selectedSort}
                onChange={handleFilterChange(setSelectedSort)}
              >
                <option value="">Sort by</option>
                {sortOptions.map((option, i) => (
                  <option key={i} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="tours-list">
          {filteredAndSortedTours.map((tour, i) => (
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
          ))}
        </div>
      </div>
    </section>
  );
};

export default Tours;
