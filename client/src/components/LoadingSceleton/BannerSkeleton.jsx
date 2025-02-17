import "./BannerSkeleton.scss";

const BannerSkeleton = () => {
  return (
    <div className="banner-skeleton">
      <div className="skeleton-slider-container">
        <div className="skeleton-slider-track">
          <div className="skeleton-slider-card"></div>
        </div>
      </div>
      <div className="skeleton-slider-dots">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="skeleton-dot"></div>
        ))}
      </div>
    </div>
  );
};

export default BannerSkeleton;
