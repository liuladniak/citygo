import "./About.scss";
import teamImg from "../../assets/images/team.jpg";
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
          Since 2012, CityGo has been making travel unforgettable by connecting
          over 55000 explorers with local guides in Istanbul and its surrounding
          areas. Our mission is to offer tours that go beyond the usual tourist
          spots. Whether it's tasting authentic street food in Istanbul's
          vibrant markets, exploring hidden alleyways in the Old City, or
          discovering secret viewpoints along the Bosphorus, we bring travelers
          closer to the heart of this unique region. We’re proud that many of
          our tours receiving 5-star reviews. Our guides aren’t just experts;
          they’re passionate locals who share their unique stories and favorite
          spots that most tourists miss. From historical walking tours to food
          and cultural experiences, we offer diverse options for every kind of
          traveler.
        </p>
      </div>

      <div className="about-team">
        <div className="about-team__img">
          <img src={teamImg} alt="Founders image" />
        </div>
        <div className="about-team__story">
          <h2 className="about-team__heading">Where it all began</h2>
          <p className="about-team__desc">
            CityGo began with a desire to offer travelers more than just
            sightseeing—it’s about connecting with the soul of Istanbul. Founded
            by a team of local explorers, we set out to share the city’s
            stories, culture, and spirit with those who seek a deeper journey,
            beyond the usual tourist paths. We craft experiences that celebrate
            Istanbul in all its dimensions—from the majestic landmarks to the
            quiet corners where history whispers. Our tours are for those who
            want to immerse themselves in the real Istanbul, whether it's
            navigating the bustling streets, savoring authentic flavors, or
            discovering hidden gems along the Bosphorus. Quality and
            authenticity drive us. Our passionate guides are more than
            experts—they’re locals with stories, eager to share their love for
            the city. Every tour with CityGo is a step closer to understanding
            Istanbul through the eyes of those who call it home. At CityGo, we
            believe travel should be personal, meaningful, and unforgettable.
          </p>
        </div>
      </div>
      <div className="about-stats container-centered">
        <h3 className="about-section__heading about-stats">
          GityGo in numbers
        </h3>
        <p className="about-section__subheading">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Eaque totam
          nam dicta illum ipsa accusantium tempora dolor vero, maxime impedit
          ipsam nesciunt libero iste veniam excepturi, fuga quos facilis facere?
        </p>

        <Stats />
      </div>

      <div className="about-container">
        <h2 className="about-section__heading">
          Your Trusted Partner in Exploring the city
        </h2>
        <p className="about-section__subheading">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Eaque totam
          nam dicta illum ipsa accusantium tempora dolor vero, maxime impedit
          ipsam nesciunt libero iste veniam excepturi, fuga quos facilis facere?
        </p>
      </div>
      <div className="container-centered about-careers">
        <div className="overlay--category"></div>
        <h2 className="about-section__heading about-section__heading--careers">
          Want to become a part of our team?
        </h2>

        <Button>View positions</Button>
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
