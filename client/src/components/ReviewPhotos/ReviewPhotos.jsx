import { useState } from "react";
import Lightbox from "../Lightbox/Lightbox";
import "./ReviewPhotos.scss";

const ReviewPhotos = ({ reviews }) => {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const allPhotos = reviews.flatMap((r) => r.photos ?? []);

  if (allPhotos.length === 0) return null;

  return (
    <>
      <div className="review-photos" aria-label="Photos from travellers">
        <h4 className="review-photos__heading">
          Photos from travellers
          <span className="review-photos__count">{allPhotos.length}</span>
        </h4>

        <div className="review-photos__strip" role="list">
          {allPhotos.map((url, i) => (
            <button
              key={i}
              type="button"
              role="listitem"
              className="review-photos__thumb"
              aria-label={`View traveller photo ${i + 1} of ${allPhotos.length}`}
              onClick={() => setLightboxIndex(i)}
            >
              <img src={url} alt="" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={allPhotos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
};

export default ReviewPhotos;
