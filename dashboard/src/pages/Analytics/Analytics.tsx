import Header from "../../components/Header/Header";
import "./Analytics.scss";

const Analytics = () => {
  return (
    <section className="analytics">
      <Header pageTitle="Analytics" />

      <div className="cards">
        <div className="card">Todays bookings</div>
        <div className="card">Todays bookings</div>
      </div>
    </section>
  );
};

export default Analytics;
