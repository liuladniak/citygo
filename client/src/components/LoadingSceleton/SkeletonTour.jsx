// import "./SkeletonTour.scss";

// const SkeletonTour = () => {
//   return (
//     <section className="tour">
//       <div className="tour-wrp">
//         <div className="tour-hero">
//           <div className="skeleton skeleton-img-main"></div>

//           <div className="tour-text skeleton-text">
//             <div className="skeleton skeleton-heading"></div>
//             <div className="tour-tags skeleton-tags">
//               <div className="tour-tags--l">
//                 <div className="skeleton skeleton-tag"></div>
//                 <div className="skeleton skeleton-tag"></div>
//                 <div className="skeleton skeleton-tag"></div>
//               </div>
//               <div className="tour-tags--r">
//                 <div className="skeleton skeleton-btn"></div>
//                 <div className="skeleton skeleton-btn"></div>
//               </div>
//             </div>
//           </div>

//           <div className="skeleton skeleton-img-secondary"></div>
//           <div className="skeleton skeleton-img-secondary"></div>
//           <div className="skeleton skeleton-img-secondary"></div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default SkeletonTour;

import "./SkeletonTour.scss";

const SkeletonTour = () => {
  return (
    <section className="tour">
      <div className="tour-wrp">
        {/* Hero Section Skeleton */}
        <div className="tour-hero">
          <div className="skeleton skeleton-img-main"></div>

          <div className="tour-text">
            <div className="skeleton skeleton-heading"></div>
            <div className="tour-tags">
              <div className="tour-tags--l">
                <div className="skeleton skeleton-tag"></div>
                <div className="skeleton skeleton-tag"></div>
                <div className="skeleton skeleton-tag"></div>
              </div>
              <div className="tour-tags--r">
                <div className="skeleton skeleton-icon-btn"></div>
                <div className="skeleton skeleton-icon-btn"></div>
              </div>
            </div>
          </div>

          <div className="skeleton skeleton-img-link"></div>
          <div className="skeleton skeleton-img-link"></div>
          <div className="skeleton skeleton-img-link"></div>
        </div>

        {/* Nav Skeleton */}
        <div className="skeleton skeleton-nav"></div>

        {/* Content & Sidebar Skeleton */}
        <div className="tour-details-wrp">
          <div className="tour-details">
            <div className="skeleton skeleton-title-sm"></div>
            <div className="skeleton skeleton-paragraph"></div>
            <div className="skeleton skeleton-paragraph"></div>

            <div
              className="skeleton skeleton-title-sm"
              style={{ marginTop: "4rem" }}
            ></div>
            <div className="skeleton skeleton-list-item"></div>
            <div className="skeleton skeleton-list-item"></div>
            <div className="skeleton skeleton-list-item"></div>
            <div className="skeleton skeleton-list-item"></div>
          </div>

          <div className="tour-summary__dates">
            <div className="skeleton skeleton-booking-card"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkeletonTour;
