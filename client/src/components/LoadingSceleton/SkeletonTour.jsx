import "./SkeletonTour.scss";

const SkeletonTour = () => {
  return (
    <section className="tour">
      <div className="tour-wrp">
        <div className="tour-hero">
          <div className="skeleton skeleton-img-main"></div>

          <div className="tour-text skeleton-text">
            <div className="skeleton skeleton-heading"></div>
            <div className="tour-tags skeleton-tags">
              <div className="tour-tags--l">
                <div className="skeleton skeleton-tag"></div>
                <div className="skeleton skeleton-tag"></div>
                <div className="skeleton skeleton-tag"></div>
              </div>
              <div className="tour-tags--r">
                <div className="skeleton skeleton-btn"></div>
                <div className="skeleton skeleton-btn"></div>
              </div>
            </div>
          </div>

          <div className="skeleton skeleton-img-secondary"></div>
          <div className="skeleton skeleton-img-secondary"></div>
          <div className="skeleton skeleton-img-secondary"></div>
        </div>
      </div>
    </section>
  );
};

export default SkeletonTour;
