import "./Homepage.scss";
import Hero from "../../components/Hero/Hero";
import Map from "../../components/Map/Map";
import MoreServices from "../../components/MoreServices/MoreServices";
import Featured from "../../components/Featured/Featured";
import ToursIntroList from "../../components/ToursIntroList/ToursIntroList";

const Homepage = () => {
  return (
    <>
      <Hero />
      <Map />
      <MoreServices />
      <Featured />
      <ToursIntroList />
    </>
  );
};

export default Homepage;
