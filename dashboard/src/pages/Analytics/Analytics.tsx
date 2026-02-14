import { CardHeader, CardTitle } from "@/components/ui/card";
import BookingSummaryChart from "../../components/BookingSummaryChart/BookingSummaryChart";
import RevenueAreaChart from "../../components/RevenueAreaChart/RevenueAreaChart";
import "./Analytics.css";
import BackButton from "@/components/ui/BackButton";

const Analytics = () => {
  return (
    <section className="analytics">
      <CardHeader className="flex items-center">
        <BackButton />
        <CardTitle>Analytics</CardTitle>
      </CardHeader>

      <div className="cards">
        <div className="dashboard__chart">
          <RevenueAreaChart />
        </div>
        <div className="card">
          <BookingSummaryChart />
        </div>
        <div className="card">Todays bookings</div>
      </div>
    </section>
  );
};

export default Analytics;
