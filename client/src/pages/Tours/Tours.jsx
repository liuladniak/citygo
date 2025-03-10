import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import TourCard from "../../components/TourCard/TourCard";
import "./Tours.scss";
import CustomSelect from "../../components/CustomSelect/CustomSelect";
import searchIcon from "../../assets/icons/search.svg";
import Button from "../../components/Button/Button";
import ToursSkeletonCard from "../../components/LoadingSceleton/ToursSkeletonCard";
import Icon from "../../components/UI/Icon";
import {
  iconChevronLeft,
  iconChevronRight,
} from "../../components/UI/iconsPaths";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const Tours = () => {
  const API_URL = import.meta.env.VITE_API_KEY;
  console.log(API_URL, "API URL");
  const [tours, setTours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(9);
  const query = useQuery();
  const initialCategory = query.get("category") || "";
  const [selectedLandmark, setSelectedLandmark] = useState("");
  const [selectedTourType, setSelectedTourType] = useState(initialCategory);
  const [selectedActivityLevel, setSelectedActivityLevel] = useState("");
  const [selectedSort, setSelectedSort] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  console.log("Current page: " + currentPage);
  useEffect(() => {
    const getToursData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${API_URL}/api/tours?page=${currentPage}&limit=${itemsPerPage}`
        );
        const { data, totalPages } = response.data;
        const sortedTours = data.sort((a, b) => a.id - b.id);
        setTours(sortedTours);
        setTotalPages(totalPages);
        setIsLoading(false);
        console.log(data, "TOURS***##");
      } catch (error) {
        console.error("There was an error fetching the tours data!", error);
        setIsLoading(false);
      }
    };
    getToursData();
  }, [currentPage, itemsPerPage]);

  const landmarkOptions = ["Center", "Neighborhood"];
  const tourTypeOptions = ["Guided tour", "Culinary tour", "Experience"];
  const activityLevelOptions = ["Easy", "Moderate", "Hard"];
  const sortOptions = ["Lower price first", "Higher price first"];

  const handleFilterChange = (setter) => (option) => {
    setter(option);
  };

  const handleRemoveFilter = (filterType) => () => {
    if (filterType === "landmark") setSelectedLandmark("");
    if (filterType === "tourType") setSelectedTourType("");
    if (filterType === "activityLevel") setSelectedActivityLevel("");
    if (filterType === "searchQuery") setSearchQuery("");
  };

  const handleResetFilters = () => {
    setSelectedLandmark("");
    setSelectedTourType("");
    setSelectedActivityLevel("");
    setSelectedSort("");
    setSearchQuery("");
  };

  const filterTours = (tours) => {
    return tours.filter((tour) => {
      const matchesLandmark =
        !selectedLandmark || tour.landmarks === selectedLandmark;
      const matchesTourType =
        !selectedTourType || tour.category === selectedTourType;
      const matchesActivityLevel =
        !selectedActivityLevel || tour.activity_level === selectedActivityLevel;
      const matchesSearchQuery =
        !searchQuery ||
        tour.tour_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tour.highlights.some((highlight) =>
          highlight.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matches =
        matchesLandmark &&
        matchesTourType &&
        matchesActivityLevel &&
        matchesSearchQuery;

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

  const filteredTours = filterTours(tours);
  const sortedFilteredTours = sortTours(filteredTours);

  const remainingTours = tours.filter((tour) => !filteredTours.includes(tour));
  const sortedRemainingTours = sortTours(remainingTours);

  const areFiltersApplied = () => {
    return (
      selectedLandmark ||
      selectedTourType ||
      selectedActivityLevel ||
      searchQuery
    );
  };
  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <section className="tours">
      <div className="tours-heading-wrp">
        <div className="tours-type">
          <span>Explore / </span>
          <span>Find tours</span>
        </div>
        <h1 className="tours-heading">Where would you like to go?</h1>
        <p className="tours-description">
          Discover Istanbul's rich heritage, stunning landmarks, and hidden gems
          with our expert guided tours. Whether you love history, nature, or
          cuisine, we have the perfect tour for you. Explore iconic sites,
          vibrant neighborhoods, and unique experiences for an unforgettable
          visit. Join us for an immersive journey filled with stories, insights,
          and memorable moments.
        </p>
      </div>

      <div className="tours-wrp">
        <div className="tours-filter">
          <div className="tours-filter-wrp">
            <div className="tours-filter-l">
              <div className="tours-filter__select-wrp">
                <CustomSelect
                  options={landmarkOptions}
                  value={selectedLandmark}
                  onChange={handleFilterChange(setSelectedLandmark)}
                  placeholder="Select Landmark"
                />
              </div>
              <div className="tours-filter__select-wrp">
                <CustomSelect
                  options={tourTypeOptions}
                  value={selectedTourType}
                  onChange={handleFilterChange(setSelectedTourType)}
                  placeholder="Select Tour Type"
                />
              </div>
              <div className="tours-filter__select-wrp">
                <CustomSelect
                  options={activityLevelOptions}
                  value={selectedActivityLevel}
                  onChange={handleFilterChange(setSelectedActivityLevel)}
                  placeholder="Select Activity Level"
                />
              </div>
              <div className="tours-filter__select-wrp">
                <CustomSelect
                  options={sortOptions}
                  value={selectedSort}
                  onChange={handleFilterChange(setSelectedSort)}
                  placeholder="Sort by"
                />
              </div>
            </div>
            <div className="tours-filter-r">
              <div className="tours-filter__select-wrp search-wrp">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tours"
                  className="tours-filter__search-input"
                />
                <img
                  className="search-icon"
                  src={searchIcon}
                  alt="search icon"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="tours-filter-selections">
          <div className="tours-filter__pills">
            {selectedLandmark && (
              <div className="tours-filter__pill">
                {selectedLandmark}
                <span
                  className="tours-filter__pill__close"
                  onClick={handleRemoveFilter("landmark")}
                >
                  &times;
                </span>
              </div>
            )}
            {selectedTourType && (
              <div className="tours-filter__pill">
                {selectedTourType}
                <span
                  className="tours-filter__pill__close"
                  onClick={handleRemoveFilter("tourType")}
                >
                  &times;
                </span>
              </div>
            )}
            {selectedActivityLevel && (
              <div className="tours-filter__pill">
                {selectedActivityLevel}
                <span
                  className="tours-filter__pill__close"
                  onClick={handleRemoveFilter("activityLevel")}
                >
                  &times;
                </span>
              </div>
            )}
            {searchQuery && (
              <div className="tours-filter__pill">
                {searchQuery}
                <span
                  className="tours-filter__pill__close"
                  onClick={handleRemoveFilter("searchQuery")}
                >
                  &times;
                </span>
              </div>
            )}
          </div>

          {areFiltersApplied() && (
            <Button
              onClick={handleResetFilters}
              className="btn btn--reset-filter"
              text="Remove all filters"
            />
          )}
        </div>

        {isLoading ? (
          <div className="tours-cards-skeleton">
            {Array(6)
              .fill()
              .map((_, index) => (
                <ToursSkeletonCard
                  key={index}
                  className="tours-card-skeleton"
                />
              ))}
          </div>
        ) : (
          <div className="tours-list">
            <div className="tours-list__filtered">
              {sortedFilteredTours.length ? (
                sortedFilteredTours.map((tour, i) => (
                  <TourCard
                    key={i}
                    tour_name={tour.tour_name}
                    id={tour.id}
                    tour_thumbnail={tour.images[0]}
                    highlights={tour.highlights}
                    duration={tour.duration}
                    price={tour.price}
                    category={tour.category}
                    images={tour.images}
                    featured={tour.featured}
                  />
                ))
              ) : (
                <div>
                  <h2 className="tours-list__filtered-heading">
                    <div>
                      No tours match your current filters. Try adjusting them to
                      explore more options, or check out the tours below.
                    </div>
                  </h2>
                </div>
              )}
            </div>

            <div className="tours-list__remaining">
              {sortedRemainingTours.map((tour, i) => (
                <TourCard
                  key={i}
                  tour_name={tour.tour_name}
                  id={tour.id}
                  tour_thumbnail={tour.images[0]}
                  highlights={tour.highlights}
                  duration={tour.duration}
                  price={tour.price}
                  category={tour.category}
                  images={tour.images}
                  featured={tour.featured}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="tours-pagination">
        <button
          className="tours-prev"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Icon iconPath={iconChevronLeft} className="pagination-controls" />
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            className={`tours-page ${
              currentPage === index + 1 ? "active" : ""
            }`}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
        <button
          className="tours-next"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <Icon iconPath={iconChevronRight} className="pagination-controls" />
        </button>
      </div>
    </section>
  );
};

export default Tours;
