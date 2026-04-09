import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import TourCard from "../../components/TourCard/TourCard";
import "./Tours.scss";
import CustomSelect from "../../components/CustomSelect/CustomSelect";
import searchIcon from "../../assets/icons/search.svg";
import ToursSkeletonCard from "../../components/LoadingSceleton/ToursSkeletonCard";
import Icon from "../../components/UI/Icon";
import {
  iconChevronLeft,
  iconChevronRight,
} from "../../components/UI/iconsPaths";
import FiltersComponent from "../../components/FiltersComponent/FiltersComponent";

const useQuery = () => new URLSearchParams(useLocation().search);

const Tours = () => {
  const API_URL = import.meta.env.VITE_API_KEY;
  const [tours, setTours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 9;

  const query = useQuery();
  const [selectedLandmark, setSelectedLandmark] = useState("");
  const [selectedTourType, setSelectedTourType] = useState(
    query.get("category") || ""
  );
  const [selectedActivityLevel, setSelectedActivityLevel] = useState("");
  const [selectedSort, setSelectedSort] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTours = async () => {
      setIsLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: itemsPerPage,
        };
        if (searchQuery) params.search = searchQuery;
        if (selectedTourType) params.category = selectedTourType;
        if (selectedActivityLevel)
          params.activity_level = selectedActivityLevel;
        if (selectedLandmark) params.landmarks = selectedLandmark;

        const response = await axios.get(`${API_URL}/api/tours`, { params });
        let data = response.data.data ?? [];

        if (selectedSort === "Lower price first")
          data = [...data].sort((a, b) => a.price - b.price);
        if (selectedSort === "Higher price first")
          data = [...data].sort((a, b) => b.price - a.price);

        setTours(data);
        setTotalPages(response.data.totalPages);
        setTotalCount(response.data.total);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTours();
  }, [
    currentPage,
    searchQuery,
    selectedTourType,
    selectedActivityLevel,
    selectedLandmark,
    selectedSort,
  ]);

  const handleFilterChange = (setter) => (value) => {
    setter(value ?? "");
    setCurrentPage(1);
  };

  const handleRemoveFilter = (type) => () => {
    setCurrentPage(1);
    if (type === "landmark") setSelectedLandmark("");
    if (type === "tourType") setSelectedTourType("");
    if (type === "activityLevel") setSelectedActivityLevel("");
    if (type === "searchQuery") setSearchQuery("");
    if (type === "sort") setSelectedSort("");
  };

  const handleResetFilters = () => {
    setSelectedLandmark("");
    setSelectedTourType("");
    setSelectedActivityLevel("");
    setSelectedSort("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const hasFilters =
    selectedLandmark ||
    selectedTourType ||
    selectedActivityLevel ||
    searchQuery ||
    selectedSort;

  const landmarkOptions = ["Center", "Neighborhood"];
  const tourTypeOptions = ["Guided tour", "Culinary tour", "Experience"];
  const activityLevelOptions = ["Easy", "Moderate", "Hard"];
  const sortOptions = ["Lower price first", "Higher price first"];

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
          cuisine, we have the perfect tour for you.
        </p>
      </div>

      <div className="tours-wrp">
        <div className="tours-filter">
          <FiltersComponent>
            <div className="tours-filter-wrp">
              <div className="tours-filter-l">
                <div className="tours-filter__select-wrp">
                  <CustomSelect
                    optionsClassName="tours-filter__options"
                    options={landmarkOptions}
                    value={selectedLandmark}
                    onChange={handleFilterChange(setSelectedLandmark)}
                    placeholder="Select Landmark"
                  />
                </div>
                <div className="tours-filter__select-wrp">
                  <CustomSelect
                    optionsClassName="tours-filter__options"
                    options={tourTypeOptions}
                    value={selectedTourType}
                    onChange={handleFilterChange(setSelectedTourType)}
                    placeholder="Select Tour Type"
                  />
                </div>
                <div className="tours-filter__select-wrp">
                  <CustomSelect
                    optionsClassName="tours-filter__options"
                    options={activityLevelOptions}
                    value={selectedActivityLevel}
                    onChange={handleFilterChange(setSelectedActivityLevel)}
                    placeholder="Select Activity Level"
                  />
                </div>
                <div className="tours-filter__select-wrp">
                  <CustomSelect
                    optionsClassName="tours-filter__options"
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
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search tours"
                    className="tours-filter__search-input"
                  />
                  <img className="search-icon" src={searchIcon} alt="search" />
                </div>
              </div>
            </div>
          </FiltersComponent>
        </div>

        {hasFilters && (
          <div className="tours-filter-selections">
            <div className="tours-filter__pills">
              {selectedLandmark && (
                <div className="tours-filter__pill">
                  <span>{selectedLandmark}</span>
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
                  <span>{selectedTourType}</span>
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
                  <span>{selectedActivityLevel}</span>
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
                  <span>{searchQuery}</span>
                  <span
                    className="tours-filter__pill__close"
                    onClick={handleRemoveFilter("searchQuery")}
                  >
                    &times;
                  </span>
                </div>
              )}
              {selectedSort && (
                <div className="tours-filter__pill">
                  <span>{selectedSort}</span>
                  <span
                    className="tours-filter__pill__close"
                    onClick={handleRemoveFilter("sort")}
                  >
                    &times;
                  </span>
                </div>
              )}
              <button
                className="tours-filter__pill tours-filter__pill--reset"
                onClick={handleResetFilters}
              >
                Clear all &times;
              </button>
            </div>
            <p className="tours-filter__count">
              {totalCount} {totalCount === 1 ? "tour" : "tours"} found
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="tours-grid">
            {Array(6)
              .fill()
              .map((_, i) => (
                <ToursSkeletonCard key={i} />
              ))}
          </div>
        ) : tours.length === 0 ? (
          <>
            <div className="tours-empty">
              <p>No tours match your filters.</p>
              <button
                className="tours-filter__pill tours-filter__pill--reset"
                onClick={handleResetFilters}
              >
                Clear all filters
              </button>
            </div>
            <TourSuggestions API_URL={API_URL} />
          </>
        ) : (
          <div className="tours-grid">
            {tours.map((tour) => (
              <TourCard
                key={tour.id}
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
        )}
      </div>

      {totalPages > 1 && (
        <div className="tours-pagination">
          <button
            className="tours-prev"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            <Icon iconPath={iconChevronLeft} className="pagination-controls" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`tours-page ${currentPage === i + 1 ? "active" : ""}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="tours-next"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <Icon iconPath={iconChevronRight} className="pagination-controls" />
          </button>
        </div>
      )}
    </section>
  );
};

export default Tours;

const TourSuggestions = ({ API_URL }) => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/tours?page=1&limit=3`)
      .then((res) => setSuggestions(res.data.data ?? []))
      .catch(() => {});
  }, []);

  if (!suggestions.length) return null;

  return (
    <div className="tours-suggestions">
      <h3 className="tours-suggestions__heading">
        You might enjoy these instead
      </h3>
      <div className="tours-grid">
        {suggestions.map((tour) => (
          <TourCard
            key={tour.id}
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
  );
};
