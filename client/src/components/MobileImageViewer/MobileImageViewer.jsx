import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import "./MobileImageViewer.scss";

const MobileImageViewer = ({ images, startIndex, onClose }) => {
  const [current, setCurrent] = useState(startIndex);

  const prev = useCallback(() => {
    setCurrent((i) => (i === 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setCurrent((i) => (i === images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, prev, next]);

  return createPortal(
    <div className="mob-viewer" role="dialog" aria-modal="true">
      <button
        className="mob-viewer__close"
        onClick={onClose}
        aria-label="Close"
      >
        ✕
      </button>

      <span className="mob-viewer__counter">
        {current + 1} / {images.length}
      </span>

      <div className="mob-viewer__img-wrap">
        <img
          key={current}
          src={images[current]}
          alt={`Photo ${current + 1}`}
          className="mob-viewer__img"
        />
      </div>

      {images.length > 1 && (
        <>
          <button
            className="mob-viewer__nav mob-viewer__nav--prev"
            onClick={prev}
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            className="mob-viewer__nav mob-viewer__nav--next"
            onClick={next}
            aria-label="Next"
          >
            ›
          </button>
        </>
      )}

      {images.length > 1 && (
        <div className="mob-viewer__strip">
          {images.map((url, i) => (
            <button
              key={i}
              type="button"
              className={`mob-viewer__thumb ${i === current ? "mob-viewer__thumb--active" : ""}`}
              onClick={() => setCurrent(i)}
              aria-label={`Photo ${i + 1}`}
            >
              <img src={url} alt="" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
};

export default MobileImageViewer;
