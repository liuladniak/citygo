import "./Stats.scss";

import statImg5 from "../../assets/images/stat-5.webp";
import statImg2 from "../../assets/images/stat-11.webp";
import statImg9 from "../../assets/images/stat-14.webp";
import { Fragment } from "react";

const stats = [
  { title: "Happy Travelers", value: "85+", img: statImg9 },
  { title: "Tour Guides", value: "45+", img: statImg2 },
  { title: "Total Tours", value: "50+", img: statImg5 },
];

const Stats = () => {
  return (
    <div className="stats-container">
      {stats.map((stat, index) => (
        <Fragment key={index}>
          <Stat stat={stat} index={index} />
        </Fragment>
      ))}
    </div>
  );
};

export default Stats;

const Stat = ({ stat, index }) => {
  return (
    <div className={`stat-card stat-card--${index}`}>
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
