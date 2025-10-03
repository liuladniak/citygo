import { useState, useEffect } from "react";
import "./FiltersComponent.scss";
import Button from "../Button/Button";

function FiltersComponent({ children }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleFilters = () => {
    setFiltersOpen(!filtersOpen);
  };

  return (
    <div className="filters">
      {isMobile ? (
        <div>
          <Button className="btn btn--tours-filters" onClick={toggleFilters}>
            Filters
          </Button>
          {filtersOpen && <div className="filters-mobile">{children}</div>}
        </div>
      ) : (
        <div className="filters-desktop">{children}</div>
      )}
    </div>
  );
}

export default FiltersComponent;
