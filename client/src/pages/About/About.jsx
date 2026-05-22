import "./About.scss";
import teamImg from "../../assets/images/about-team1.webp";
import WhyUs from "../../components/WhyUs/WhyUs";
import ToursIntroList from "../../components/ToursIntroList/ToursIntroList";
import Button from "../../components/Button/Button";
import Stats from "../../components/Stats/Stats";

const About = () => {
  return (
    <div className="about">
      <div className="about-banner">
        <h1 className="about-heading">Turning Dreams Into Destinations</h1>
      </div>
      <div className="about-hero">
        <h2 className="about-hero__heading">
          Your Trusted Partner in Exploring the city
        </h2>
        <p className="about-hero__desc">
          Since 2012, CityGo has connected over 85,000 travelers with local
          guides across Istanbul and its surrounding areas. We go beyond the
          usual tourist spots — street food in the markets, hidden alleyways in
          the Old City, secret viewpoints along the Bosphorus. Our guides are
          passionate locals who share the stories and places most visitors never
          find. Whatever kind of traveler you are, there's a tour built for you.
        </p>
      </div>

      <div className="about-team">
        <div className="about-team__img">
          <img src={teamImg} alt="Founders image" loading="lazy" />
        </div>
        <div className="about-team__story">
          <h2 className="about-team__heading">Where it all began</h2>
          <p className="about-team__desc">
            CityGo began with a simple idea: Istanbul deserves more than a
            highlights reel. Founded by a team of local explorers, we set out to
            share the city's stories, culture, and hidden corners with travelers
            who want something real. Our guides aren't just experts; they're
            locals with their own relationship to this city, eager to show you
            the parts that don't make it onto the map. Every tour with CityGo is
            a step closer to understanding Istanbul through the eyes of those
            who call it home.
          </p>
        </div>
      </div>
      <div className="about-stats container-centered">
        <h3 className=" about-stats">GityGo in numbers</h3>
        <p className="about-section__subheading">
          With over 50 unique tours, 10,000 satisfied customers annually, and
          partnerships with more than 50 local guides, CityGo is at the
          forefront of immersive travel experiences. Our tours cover everything
          from historical landmarks to culinary delights, ensuring that every
          traveler finds something to cherish.
        </p>

        <Stats />
      </div>

      <div className="about-container">
        <h2 className="about-section__heading">
          Your Trusted Partner in Exploring the city
        </h2>
        <p className="about-section__subheading">
          At CityGo, we’re more than a travel company; we’re a passionate team
          dedicated to creating unforgettable experiences. If you love travel
          and want to make a difference, join us in showcasing the beauty of
          Istanbul and inspiring travelers together!
        </p>
      </div>

      <div className="about-careers-wrp">
        <div className="about-careers">
          <h2 className="about-section__heading about-section__heading--careers">
            Want to become a part of our team?
          </h2>
          <Button className="btn--careers">View positions</Button>
        </div>
      </div>

      <div className="container-centered">
        <ToursIntroList />
      </div>
      <div className="container-centered">
        <h2 className="about-section__heading">Why choose us</h2>
        <WhyUs />
      </div>
    </div>
  );
};

export default About;
