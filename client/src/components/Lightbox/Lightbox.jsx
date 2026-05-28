import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import "./Lightbox.scss";

/**
 * Lightbox — portal-based image preview
 *
 * Props:
 *   images       string[]   all image URLs
 *   currentIndex number     which image is active
 *   onClose      () => void
 *   onNavigate   (index: number) => void   parent owns the index
 */
const Lightbox = ({ images, currentIndex, onClose, onNavigate }) => {
  const total = images.length;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < total - 1;

  const prev = useCallback(() => {
    if (hasPrev) onNavigate(currentIndex - 1);
  }, [hasPrev, currentIndex, onNavigate]);

  const next = useCallback(() => {
    if (hasNext) onNavigate(currentIndex + 1);
  }, [hasNext, currentIndex, onNavigate]);

  // keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  return createPortal(
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${currentIndex + 1} of ${total}`}
      onClick={onClose}
    >
      {/* close */}
      <button
        className="lightbox__close"
        type="button"
        aria-label="Close"
        onClick={onClose}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 2l14 14M16 2L2 16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* counter */}
      {total > 1 && (
        <span
          className="lightbox__counter"
          aria-live="polite"
          aria-atomic="true"
        >
          {currentIndex + 1} / {total}
        </span>
      )}

      {/* main image — click doesn't bubble to backdrop */}
      <div className="lightbox__stage" onClick={(e) => e.stopPropagation()}>
        <img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`Photo ${currentIndex + 1} of ${total}`}
          className="lightbox__img"
        />
      </div>

      {/* prev */}
      {hasPrev && (
        <button
          className="lightbox__nav lightbox__nav--prev"
          type="button"
          aria-label="Previous photo"
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M13 16l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {/* next */}
      {hasNext && (
        <button
          className="lightbox__nav lightbox__nav--next"
          type="button"
          aria-label="Next photo"
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M7 4l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {/* thumbnail strip — only when multiple images */}
      {total > 1 && (
        <div
          className="lightbox__strip"
          role="tablist"
          aria-label="All photos"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((url, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === currentIndex}
              aria-label={`Photo ${i + 1}`}
              className={`lightbox__thumb ${i === currentIndex ? "lightbox__thumb--active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(i);
              }}
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

export default Lightbox;
