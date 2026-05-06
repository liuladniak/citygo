import { useState, useEffect } from "react";
import "./FiltersComponent.scss";

function FiltersComponent({ children }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isMobile) {
    return <div className="filters filters--desktop">{children}</div>;
  }

  return (
    <div className="filters filters--mobile">
      <button
        className="filters__toggle"
        onClick={() => setFiltersOpen(!filtersOpen)}
        aria-expanded={filtersOpen}
      >
        <span>🔍 Filters & Search</span>
        <span className="filters__toggle-arrow">{filtersOpen ? "▲" : "▼"}</span>
      </button>
      {filtersOpen && <div className="filters__panel">{children}</div>}
    </div>
  );
}

export default FiltersComponent;
