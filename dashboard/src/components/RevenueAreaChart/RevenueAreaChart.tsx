import revenueData from "../../data/revenueData.json";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const RevenueAreaChart = () => {
  const tooltipFormatter = (
    value: string | number,
    name: string,
    entry?: any
  ): [string, string] => {
    if (entry?.payload) {
      const monthData = entry.payload;
      const tours = Object.keys(monthData)
        .filter((key) => key !== "month" && key !== "totalRevenue")
        .map((key) => `${key}: $${monthData[key]}`)
        .join(", ");

      return [`$${monthData.totalRevenue}`, tours];
    }

    return [`${value}`, `${name}`];
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart width={600} height={400} data={revenueData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={tooltipFormatter} />

        <Area
          type="monotone"
          dataKey="totalRevenue"
          stroke="#8884d8"
          fillOpacity={0.3}
          fill="#8884d8"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default RevenueAreaChart;
