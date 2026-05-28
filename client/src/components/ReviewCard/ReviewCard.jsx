import { useState } from "react";
import StarRating from "../StarRating/StarRating";
import Lightbox from "../Lightbox/Lightbox";
import "./ReviewCard.scss";

const ReviewCard = ({ review }) => {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const {
    rating,
    title,
    body,
    photos = [],
    first_name,
    last_initial,
    country,
    tour_date,
  } = review;

  const tourYear = tour_date ? new Date(tour_date).getFullYear() : null;

  return (
    <>
      <div className="review-card">
        <div className="review-card__header">
          <StarRating rating={rating} mode="display" size="sm" />
          <span className="review-card__verified">Verified booking</span>
        </div>

        {title && <h4 className="review-card__title">{title}</h4>}
        <p className="review-card__body">{body}</p>

        {photos.length > 0 && (
          <div className="review-card__photos" role="list">
            {photos.map((url, i) => (
              <button
                key={i}
                type="button"
                role="listitem"
                className="review-card__photo-btn"
                aria-label={`View photo ${i + 1} of ${photos.length}`}
                onClick={() => setLightboxIndex(i)}
              >
                <img src={url} alt="" aria-hidden="true" />
              </button>
            ))}
          </div>
        )}

        <div className="review-card__author">
          <span className="review-card__name">
            {first_name} {last_initial}.
            {country && (
              <span className="review-card__country"> · {country}</span>
            )}
          </span>
          {tourYear && (
            <span className="review-card__tour-year">
              Tour taken in {tourYear}
            </span>
          )}
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
};

export default ReviewCard;
