import bookingData from "../../data/monthlyBookingData.json";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const BookingSummaryChart = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={bookingData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="tourA" stackId="a" fill="#F6EBAF" name="Tour A" />
        <Bar dataKey="tourB" stackId="a" fill="#FF6F61" name="Tour B" />
        <Bar dataKey="tourC" stackId="a" fill="#78C7D9" name="Tour C" />
        <Bar dataKey="tourD" stackId="a" fill="#F5A3D7" name="Tour D" />
        <Bar dataKey="tourE" stackId="a" fill="#FFB3B3" name="Tour E" />
        <Bar dataKey="tourF" stackId="a" fill="#A3C74E" name="Tour F" />
        <Bar dataKey="tourG" stackId="a" fill="#F6C9A7" name="Tour G" />
        <Bar dataKey="tourH" stackId="a" fill="#D7C6E0" name="Tour H" />
        <Bar dataKey="tourI" stackId="a" fill="#A0C6FF" name="Tour I" />
        <Bar dataKey="tourJ" stackId="a" fill="#F3D24E" name="Tour J" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BookingSummaryChart;
