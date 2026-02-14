// import {
//   calenderIconPath,
//   clockPath,
//   groupIconPath,
//   phonePath,
// } from "../ui/SVGIcons/iconPaths";
// import ayasofiaImg from "../../assets/images/aya-sofia.webp";
// import bosphorusImg from "../../assets/images/bosphorus.webp";
// import foodImg from "../../assets/images/baklava.webp";
// import photoImg from "../../assets/images/photoshoot.webp";

// interface Task {
//   id: number;
//   taskIcon: string;
//   popularTourImg: string;
//   taskHeading: string;
// }

// const popularTours = [
//   {
//     taskIcon: phonePath,
//     popularTourImg: ayasofiaImg,
//     taskHeading: "Historical Istanbul Walking Tour",
//   },
//   {
//     taskIcon: calenderIconPath,
//     popularTourImg: bosphorusImg,
//     taskHeading: "Bosphorus Cruise and Spice Market Tour",
//   },
//   {
//     taskIcon: groupIconPath,
//     popularTourImg: foodImg,
//     taskHeading: "Istanbul Food and Culture Tour",
//   },
//   {
//     taskIcon: clockPath,
//     popularTourImg: photoImg,
//     taskHeading: "Istanbul Photography Tour",
//   },
// ];

// const PopularTours = () => {
//   return (
//     <div className="flex-1 rounded-lg border shadow-xs bg-white border-slate-20">
//       <div className="p-6 flex items-center justify-between space-y-0 pb-4">
//         <h3 className="tracking-tight text-lg font-semibold text-slate-900">
//           Featured Tours
//         </h3>
//       </div>
//       <div className="p-6 pt-0 space-y-3">
//         {popularTours.map((tour, i) => (
//           <PopularTour
//             key={i}
//             taskIcon={tour.taskIcon}
//             taskHeading={tour.taskHeading}
//             popularTourImg={tour.popularTourImg}
//           />
//         ))}

//         <div className="pt-2 border-t border-slate-200">
//           <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2  focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 rounded-md px-3 w-full text-warm-brown hover:text-travel-blue-700 hover:bg-travel-blue-50">
//             View All Products
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PopularTours;

// const PopularTour = ({ taskIcon, taskHeading, popularTourImg }) => {
//   return (
//     <div className="flex items-center justify-between p-4 gap-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
//       <img src={popularTourImg} className="w-24" />
//       <h4 className="text-sm font-medium text-slate-900 truncate">
//         {taskHeading}
//       </h4>
//       <span>120$</span>
//     </div>
//   );
// };

const PopularTours = () => {
  return <div>PopularTours</div>;
};

export default PopularTours;
