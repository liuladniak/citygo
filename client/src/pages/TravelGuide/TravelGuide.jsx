import "./TravelGuide.scss";

import Button from "../../components/Button/Button";
import BannerSlider from "../../components/BannerSlider/BannerSlider";
import { useEffect, useState } from "react";
import axios from "axios";
import ToursSkeletonCard from "../../components/LoadingSceleton/ToursSkeletonCard";
import BannerSkeleton from "../../components/LoadingSceleton/BannerSkeleton";
import { Link } from "react-router-dom";

const TravelGuide = () => {
  const [articles, setArticles] = useState([]);
  const [bannerArticles, setBannerArticles] = useState([]);
  const [cardArticles, setCardArticles] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        console.log("Fetching articles");
        const response = await axios.get(
          `${API_URL}/api/articles?limit=8&page=1`
        );
        setArticles(response.data.data);
        setBannerArticles(response.data.data.slice(0, 3));
        setCardArticles(response.data.data.slice(3));
        console.log("articles response data:", response.data.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching articles:", error);
        setError("Failed to load articles");
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="guide">
      <div className="tours-heading-wrp">
        <h1 className="tours-heading">How we travel</h1>
        <p className="tours-description">
          Explore Istanbul's vibrant neighborhoods, serene islands, and iconic
          spots. Whether you're seeking history, adventure, or relaxation, our
          curated destinations offer something for everyone. Discover the magic
          of Istanbul, one destination at a time.
        </p>
      </div>

      {isLoading ? (
        <BannerSkeleton />
      ) : (
        <BannerSlider articles={bannerArticles} />
      )}

      {isLoading ? (
        <div className="tour-cards--skeleton">
          {Array(3)
            .fill()
            .map((_, index) => (
              <ToursSkeletonCard
                key={index}
                className="tour-intro-card--skeleton"
              />
            ))}
        </div>
      ) : (
        <div className="article-cards">
          {cardArticles.map((article, i) => {
            return (
              <div
                // <Link
                // to={`/article/${article.slug}`}
                key={i}
                className="article-card"
              >
                <div className="article-card__img">
                  <img
                    src={`${API_URL}/articles/${article.images[0]}`}
                    alt={article.title}
                  />
                </div>
                <div className="article-card__desc">
                  <span>{article.category}</span>
                  <h3>{article.title}</h3>
                </div>
                {/* </Link> */}
              </div>
            );
          })}
        </div>
      )}

      <div className="guide-pagination">
        <button className="btn btn--disabled" disabled>
          More
        </button>
      </div>
    </div>
  );
};

export default TravelGuide;
