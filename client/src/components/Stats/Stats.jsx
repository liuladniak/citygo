import "./Stats.scss";

import statImg4 from "../../assets/images/stat-3.webp";
import statImg3 from "../../assets/images/stat-10.webp";
import statImg2 from "../../assets/images/stat-11.webp";
import statImg1 from "../../assets/images/stat-2.webp";
import { Fragment } from "react";

const stats = [
  { title: "Travelers", value: "85K+", img: statImg1 },
  { title: "Tour Guides", value: "45+", img: statImg2 },
  { title: "Total Tours", value: "50+", img: statImg3 },
];

const tabletStat = {
  title: "Years of Experience",
  value: "12+",
  img: statImg4,
};

const Stats = () => {
  return (
    <div className="stats-container">
      {stats.map((stat, index) => (
        <Fragment key={index}>
          <Stat stat={stat} index={index} />
        </Fragment>
      ))}
      <Stat stat={tabletStat} index={3} isTabletOnly />
    </div>
  );
};

export default Stats;

const Stat = ({ stat, index, isTabletOnly }) => {
  return (
    <div
      className={`stat-card stat-card--${index}${isTabletOnly ? " stat-card--tablet-only" : ""}${!stat.img ? " stat-card--no-img" : ""}`}
    >
      <div className="stat-card__img">
        {stat.img && (
          <img
            src={stat.img}
            alt={stat.title}
            className="stat__img"
            loading="lazy"
          />
        )}
      </div>
      <div className="stat-card__content">
        <p className="stat__number">{stat.value}</p>
        <h3 className="stat__heading">{stat.title}</h3>
      </div>
      <div className="stat-card--4"></div>
      <div className="stat-card--5"></div>
      <div className="stat-card--6"></div>
      <div className="stat-card--7"></div>
    </div>
  );
};
