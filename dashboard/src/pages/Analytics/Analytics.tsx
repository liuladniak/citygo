import BookingSummaryChart from "../../components/BookingSummaryChart/BookingSummaryChart";
import Header from "../../components/Header/Header";
import "./Analytics.css";

const Analytics = () => {
  return (
    <section className="analytics">
      <Header pageTitle="Analytics" />

      <div className="cards">
        <div className="card">
          <BookingSummaryChart />
        </div>
        <div className="card">Todays bookings</div>
      </div>
    </section>
  );
};

export default Analytics;
