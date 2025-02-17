import "./ToursSkeletonCard.scss";

const ToursSkeletonCard = ({ className }) => {
  return (
    <div className={`skeleton-card ${className}`}>
      <div className="skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-title"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-text short"></div>
      </div>
    </div>
  );
};

export default ToursSkeletonCard;
