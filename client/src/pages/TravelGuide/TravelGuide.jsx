

import "./TravelGuide.scss";
import BannerSlider from "../../components/BannerSlider/BannerSlider";
import { useEffect, useState } from "react";
import axios from "axios";
import ToursSkeletonCard from "../../components/LoadingSceleton/ToursSkeletonCard";
import BannerSkeleton from "../../components/LoadingSceleton/BannerSkeleton";
import { Link } from "react-router-dom";

const CATEGORY_MAP = {
  All: "all",
  "Culture & History": "culture-history",
  "Food & Drink": "food-drink",
  "Nightlife & Views": "nightlife-views",
  "Nature & Adventure": "nature-adventure",
  Neighborhoods: "neighborhoods",
  "Day Trips": "day-trips",
};

const TravelGuide = () => {
  const [articles, setArticles] = useState([]);
  const [bannerArticles, setBannerArticles] = useState([]);
  const [cardArticles, setCardArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState("all");
  const API_URL = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const params = { limit: 8, page };
        if (category !== "all") params.category = category;

        const response = await axios.get(`${API_URL}/api/articles`, { params });
        const data = response.data.data;

        setArticles(data);

        // --- UX LOGIC: Handling "All" vs Specific Categories ---
        if (category === "all") {
          // Home page gets the magazine layout (Deduplicated)
          setBannerArticles(data.slice(0, 3));
          setCardArticles(data.slice(3));
        } else {
          // Category pages: Hide banner and show all items in the grid
          setBannerArticles([]);
          setCardArticles(data);
        }

        setTotalPages(response.data.totalPages);
        setIsLoading(false);
      } catch (error) {
        setError("Failed to load articles");
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, [page, category, API_URL]);

  if (error)
    return <div className="error-message p-10 text-center">{error}</div>;

  return (
    <div className="guide">
      <div className="tours-heading-wrp">
        <h1 className="tours-heading">Travel Guide</h1>
        <p className="tours-description">
          Stories, tips and inspiration for your Istanbul adventure. From hidden
          gems to iconic landmarks — everything you need to explore like a
          local.
        </p>
      </div>

      {/* --- BANNER LOGIC --- */}
      {/* We only show this on the "All" tab when content exists */}
      {category === "all" &&
        (isLoading ? (
          <BannerSkeleton />
        ) : (
          bannerArticles.length > 0 && (
            <BannerSlider articles={bannerArticles} />
          )
        ))}

      {/* Category Filters */}
      <div className="guide-filters">
        {Object.keys(CATEGORY_MAP).map((catLabel) => {
          const catValue = CATEGORY_MAP[catLabel];
          return (
            <button
              key={catValue}
              onClick={() => {
                setCategory(catValue);
                setPage(1);
              }}
              className={`guide-filter ${
                category === catValue ? "guide-filter--active" : ""
              }`}
            >
              {catLabel}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="tour-cards--skeleton">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <ToursSkeletonCard key={i} />
            ))}
        </div>
      ) : (
        <div className="article-section">
          {articles.length === 0 ? (
            <div className="no-results text-center py-20">
              <p>No articles found in this category.</p>
            </div>
          ) : (
            <div className="article-cards">
              {cardArticles.map((article) => (
                <Link
                  to={`/article/${article.slug}`}
                  key={article.id}
                  className="article-card"
                >
                  <div className="article-card__img">
                    <img
                      src={article.images[0]?.url}
                      alt={article.title}
                      loading="lazy"
                    />
                  </div>
                  <div className="article-card__desc">
                    <span className="article-card__category">
                      {article.category}
                    </span>
                    <h3 className="article-card__title">{article.title}</h3>
                    <p className="article-card__excerpt">
                      {article.description}
                    </p>
                    <span className="article-card__meta">
                      {article.read_time > 0
                        ? `${article.read_time} min read`
                        : "Quick read"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="guide-pagination">
          <button
            className="btn"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="guide-pagination__info">
            Page {page} of {totalPages}
          </span>
          <button
            className="btn"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TravelGuide;
