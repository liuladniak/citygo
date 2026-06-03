import { useState, useEffect, useRef } from "react";
import "./FiltersComponent.scss";

function FiltersComponent({ children }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 0, rootMargin: "0px" },
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [isMobile]);

  if (!isMobile) {
    return <div className="filters filters--desktop">{children}</div>;
  }

  return (
    <>
      <div ref={sentinelRef} className="filters__sentinel" />

      <div
        className={`filters filters--mobile ${isSticky ? "filters--sticky" : ""}`}
      >
        <button
          className="filters__toggle"
          onClick={() => setFiltersOpen(!filtersOpen)}
          aria-expanded={filtersOpen}
        >
          <span>🔍 Filters & Search</span>
          <span className="filters__toggle-arrow">
            {filtersOpen ? "▲" : "▼"}
          </span>
        </button>
        {filtersOpen && <div className="filters__panel">{children}</div>}
      </div>
    </>
  );
}

export default FiltersComponent;
