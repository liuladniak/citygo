import Icon from "../ui/SVGIcons/Icon";
import {
  calenderIconPath,
  chatBubble,
  groupIconPath,
  moneyDollar,
  risingPath,
  trendingDown,
} from "../ui/SVGIcons/iconPaths";

interface MainStatCard {
  title: string;
  cardIcon: string;
  value: number | string;
  trendIcon: string;
  trendValuePercent: string;
  timeframe: string;
  trendColor?: string;
  cardIconClass?: string;
}

const performanceArray = [
  {
    title: "Today Bookings",
    cardIcon: calenderIconPath,
    cardIconClass: "text-warm-brown",
    value: "12",
    trendIcon: risingPath,
    trendValuePercent: "+12%",
    timeframe: "from last month",
    trendColor: "green",
  },
  {
    title: "Currently running",
    cardIcon: groupIconPath,
    cardIconClass: "text-green-600",
    value: "6",
    trendIcon: risingPath,
    trendValuePercent: "+8%",
    timeframe: "from last month",
    trendColor: "green",
  },
  {
    title: "Upcoming bookings",
    cardIcon: moneyDollar,
    cardIconClass: "text-purple-600",
    value: "4",
    trendIcon: risingPath,
    trendValuePercent: "+23%",
    timeframe: "from last month",
    trendColor: "green",
  },
  {
    title: "Available Team",
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
    <div className="flex justify-between gap-6">
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
  cardIconClass,
}: MainStatCard) => {
  const isNegativeTrend = trendIcon === trendingDown;

  return (
    <div className=" card-hover flex-1 flex-col rounded-lg border shadow-xs transition-all duration-200 ease-in-out  bg-card text-card-foreground p-6">
      <div className="flex justify-between">
        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">
          {title}
        </h3>
        <Icon iconPath={cardIcon} className={cardIconClass} size={16} />
      </div>
      <div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          <div>
            <Icon
              iconPath={trendIcon}
              size={16}
              fill="currentColor"
              className={
                isNegativeTrend
                  ? "text-destructive"
                  : "text-emerald-600 dark:text-emerald-400"
              }
            />
          </div>
          <div
            className={
              isNegativeTrend
                ? "text-destructive"
                : "text-emerald-600 dark:text-emerald-400"
            }
          >
            {trendValuePercent}
          </div>
          <div className="ml-1">{timeframe}</div>
        </div>
      </div>
    </div>
  );
};
