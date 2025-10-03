import React from "react";
import Icon from "../ui/SVGIcons/Icon";
import {
  calenderIconPath,
  chatBubble,
  groupIconPath,
  moneyDollar,
  risingPath,
  trendingDown,
} from "../ui/SVGIcons/iconPaths";

const performanceArray = [
  {
    title: "Total Bookings",
    cardIcon: calenderIconPath,
    cardIconClass: "text-warmBrown",
    value: "247",
    trendIcon: risingPath,
    trendValuePercent: "+12%",
    timeframe: "from last month",
    trendColor: "green",
  },
  {
    title: "New Guests",
    cardIcon: groupIconPath,
    cardIconClass: "text-green-600",
    value: "1340",
    trendIcon: risingPath,
    trendValuePercent: "+8%",
    timeframe: "from last month",
    trendColor: "green",
  },
  {
    title: "Monthly Revenue",
    cardIcon: moneyDollar,
    cardIconClass: "text-purple-600",
    value: "$54,240",
    trendIcon: risingPath,
    trendValuePercent: "+23%",
    timeframe: "from last month",
    trendColor: "green",
  },
  {
    title: "Support Tickets",
    cardIcon: chatBubble,
    cardIconClass: "text-orange-600",
    value: "12",
    trendIcon: trendingDown,
    trendValuePercent: "-4%",
    timeframe: "from last month",
    trendColor: "red",
  },
];

const MainStats = () => {
  return (
    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
      {performanceArray.map((statCard, i) => (
        <StatsCard
          key={i}
          title={statCard.title}
          cardIcon={statCard.cardIcon}
          cardIconClass={statCard.cardIconClass}
          value={statCard.value}
          trendIcon={statCard.trendIcon}
          trendValuePercent={statCard.trendValuePercent}
          timeframe={statCard.timeframe}
          trendColor={statCard.trendColor}
        />
      ))}
    </div>
  );
};

export default MainStats;

const StatsCard = ({
  title,
  cardIcon,
  value,
  trendIcon,
  trendValuePercent,
  timeframe,
  trendColor,
  cardIconClass,
}) => {
  const isNegativeTrend = trendIcon === trendingDown;

  return (
    <div className=" card-hover flex-1 flex-col rounded-lg border text-card-foreground shadow-sm transition-all duration-200 ease-in-out  bg-white border-slate-200 p-6">
      <div className="flex justify-between">
        <h3 className="tracking-tight text-sm font-medium text-slate-600">
          {title}
        </h3>
        <Icon iconPath={cardIcon} className={cardIconClass} size={16} />
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div className="flex items-center text-xs text-slate-600 mt-1">
          <div>
            <Icon
              iconPath={trendIcon}
              size={16}
              className={isNegativeTrend ? "fill-red-600" : "fill-green-600"}
            />
          </div>
          <div className={isNegativeTrend ? "text-red-600" : "text-green-600"}>
            {trendValuePercent}
          </div>
          <div className="ml-1">{timeframe}</div>
        </div>
      </div>
    </div>
  );
};
