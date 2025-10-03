import React from "react";
import {
  heartPath,
  risingPath,
  starPath,
  targetPath,
} from "../ui/SVGIcons/iconPaths";
import Icon from "../ui/SVGIcons/Icon";
import PriceIcon from "../ui/SVGIcons/PriceIcon";

const personalStatsArray = [
  {
    statName: "Revenue Target",
    statIconComponent: PriceIcon,
    statIconColor: "text-emerald-600",
    value: "90%",
    trendingIcon: risingPath,
    trendingName: "Good",
  },
  {
    statName: "Satisfaction",
    statIconPath: starPath,
    statIconColor: "text-amber-500",
    value: "4.8/5",
    trendingIcon: risingPath,
    trendingName: "Good",
  },
  {
    statName: "Bookings",
    statIconPath: targetPath,
    statIconColor: "text-blue-600",
    value: "88%",
    trendingIcon: risingPath,
    trendingName: "Good",
  },
];

const MyStats = () => {
  return (
    <div className="flex-1 rounded-lg border shadow-sm bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200">
      <div className="flex flex-col space-y-1.5 p-6 pb-3">
        <h3 className="tracking-tight text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Icon iconPath={heartPath} size={16} className="fill-pink-500" /> My
          Stats
        </h3>
        <p className="text-xs text-slate-600">Your personal performance</p>
      </div>
      <div className="p-6 pt-0 space-y-4">
        {personalStatsArray.map((stat, i) => (
          <SingleStatCard
            key={i}
            statName={stat.statName}
            statIconComponent={stat.statIconComponent}
            statIconPath={stat.statIconPath}
            value={stat.value}
            trendingIcon={stat.trendingIcon}
            trendingName={stat.trendingName}
            statIconColor={stat.statIconColor}
          />
        ))}
      </div>
    </div>
  );
};

export default MyStats;

const SingleStatCard = ({
  statName,
  statIconPath,
  statIconComponent: StatIcon,
  value,
  trendingIcon,
  trendingName,
  statIconColor,
}) => {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-slate-100">
          {" "}
          {StatIcon ? (
            <StatIcon size={16} className={statIconColor} />
          ) : (
            <Icon iconPath={statIconPath} size={16} className={statIconColor} />
          )}
        </div>
        <div>
          <div className="text-sm font-medium text-slate-900">{statName}</div>
          <div className="text-xs text-slate-500">Personal goal</div>
        </div>
      </div>
      <div>
        <div className="text-lg font-bold text-slate-900">{value}</div>
        <div className="text-xs flex items-center gap-1 text-emerald-600">
          <Icon iconPath={trendingIcon} />
          {trendingName}
        </div>
      </div>
    </div>
  );
};
