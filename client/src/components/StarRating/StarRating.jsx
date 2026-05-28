import "./StarRating.scss";

const StarRating = ({
  rating = 0,
  max = 5,
  mode = "display",
  onChange,
  size = "md",
}) => {
  return (
    <div
      className={`star-rating star-rating--${size}`}
      aria-label={`${rating} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, i) => {
        const value = i + 1;
        const filled = value <= Math.round(rating);

        if (mode === "input") {
          return (
            <button
              key={i}
              type="button"
              className={`star star--input ${filled ? "star--filled" : ""}`}
              onClick={() => onChange?.(value)}
              aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
            >
              ★
            </button>
          );
        }

        return (
          <span
            key={i}
            className={`star ${filled ? "star--filled" : "star--empty"}`}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;
