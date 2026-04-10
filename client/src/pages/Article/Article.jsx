import { useParams, Link } from "react-router-dom";
import "./Article.scss";
import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../../components/UI/Loader";
import { formatDateTime } from "../../utils/formatDateTime";

const Article = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/articles/${slug}`);
        setArticle(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [slug]);

  if (isLoading) return <Loader />;
  if (!article) return <p>Article not found.</p>;

  return (
    <article className="article">
      <div className="article-hero">
        <img
          src={article.images[0]?.url}
          alt={article.title}
          className="article-hero__img"
        />
        <div className="article-hero__overlay">
          <div className="article-hero__content">
            <span className="article-hero__category">{article.category}</span>
            <h1 className="article-hero__title">{article.title}</h1>
            <div className="article-hero__meta">
              {article.author_avatar && (
                <img
                  src={article.author_avatar}
                  alt={article.author_name}
                  className="article-hero__avatar"
                />
              )}
              <div>
                <p className="article-hero__author">{article.author_name}</p>
                <p className="article-hero__date">
                  {formatDateTime(article.date_posted)}
                  {article.read_time > 0 && ` · ${article.read_time} min read`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="article-body">
        <div className="article-body__inner">
          {article.description && (
            <p className="article-body__lead">{article.description}</p>
          )}

          <div
            className="article-body__content"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {article.images.length > 1 && (
            <div className="article-body__gallery">
              {article.images.slice(1).map((img, i) => (
                <figure key={i} className="article-body__figure">
                  <img src={img.url} alt={img.caption ?? `Image ${i + 2}`} />
                  {img.caption && <figcaption>{img.caption}</figcaption>}
                </figure>
              ))}
            </div>
          )}
        </div>
      </div>

      {article.related?.length > 0 && (
        <div className="article-related">
          <div className="article-related__inner">
            <h2 className="article-related__heading">You might also like</h2>
            <div className="article-related__grid">
              {article.related.map((rel) => (
                <Link
                  to={`/article/${rel.slug}`}
                  key={rel.id}
                  className="article-related__card"
                >
                  <div className="article-related__img">
                    <img src={rel.image_url} alt={rel.title} loading="lazy" />
                  </div>
                  <div className="article-related__info">
                    <span className="article-related__category">
                      {rel.category}
                    </span>
                    <h3 className="article-related__title">{rel.title}</h3>
                    <p className="article-related__desc">{rel.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="article-back">
        <Link to="/travel-guide" className="article-back__link">
          ← Back to Travel Guide
        </Link>
      </div>
    </article>
  );
};

export default Article;
