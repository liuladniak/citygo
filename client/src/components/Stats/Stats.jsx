import "./Stats.scss";

import statImg1 from "../../assets/images/stat9.jpg";
import statImg5 from "../../assets/images/stat-5.jpg";
import statImg6 from "../../assets/images/stat-10.jpg";
import statImg2 from "../../assets/images/stat-11.jpg";
import statImg7 from "../../assets/images/stat-7.jpg";
import statImg8 from "../../assets/images/stat-8.jpg";
import statImg3 from "../../assets/images/stat-3.jpg";
import statImg4 from "../../assets/images/stat-4.jpg";
import statImg9 from "../../assets/images/stat-14.jpg";
import { Fragment } from "react";

const stats = [
  { title: "Happy Travelers", value: "85+", icon: "😊", img: statImg9 },
  // { title: "Years Operating", value: "10+", icon: "⏳", img: statImg8 },
  { title: "Tour Guides", value: "45+", icon: "🏞️", img: statImg2 },
  { title: "Total Tours", value: "50+", icon: "📍", img: statImg5 },
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
          <img src={stat.img} alt={stat.title} className="stat__img" />
        )}
      </div>
      <div className="stat-card__content">
        <p className="stat__number">{stat.value}</p>
        <h3 className="stat__heading">
          {stat.icon} {stat.title}
        </h3>
      </div>
      <div className="stat-card--4"></div>
      <div className="stat-card--5"></div>
      <div className="stat-card--6"></div>
      <div className="stat-card--7"></div>
    </div>
  );
};
