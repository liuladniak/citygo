import Header from "../../components/Header/Header.js";
import "./Tours.css";
import ToursList from "../../components/ToursList/ToursList.jsx";

const Tours = () => {
  return (
    <section className="tours ">
      <Header pageTitle="" />
      <ToursList />
    </section>
  );
};

export default Tours;
