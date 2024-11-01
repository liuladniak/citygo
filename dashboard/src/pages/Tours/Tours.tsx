import Header from "../../components/Header/Header.js";
import "./Tours.scss";
import ToursList from "../../components/ToursList/ToursList.jsx";

const Tours = () => {
  return (
    <section className="tours">
      <Header pageTitle="Tours" />
      <ToursList />
    </section>
  );
};

export default Tours;
