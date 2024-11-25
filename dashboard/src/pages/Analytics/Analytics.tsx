import BookingSummaryChart from "../../components/BookingSummaryChart/BookingSummaryChart";
import Header from "../../components/Header/Header";
import RevenueAreaChart from "../../components/RevenueAreaChart/RevenueAreaChart";
import "./Analytics.css";

const Analytics = () => {
  return (
    <section className="analytics">
      <Header pageTitle="Analytics" />

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
