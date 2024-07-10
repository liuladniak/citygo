import "./Hero.scss";
import videoHero from "../../assets/videos/newcool381sec230516webyk2.mp4";
import VideoComponent from "../VideoComponent/VideoComponent";
import { Link } from "react-router-dom";
import culinaryImg from "../../assets/images/culinarytours.webp";
import Button from "../Button/Button";
import sloganImg from "../../assets/icons/slogan.svg";
import guidedImg from "../../assets/images/guided.webp";
import experiencesImg from "../../assets/images/experiences.jpg";
import arrowUpRightIcon from "../../assets/icons/arrow-up-right.svg";

const Hero = () => {
  return (
    <section className="hero">
      <h1 className="hero-heading">Guided tours: Discover Majestic İstanbul</h1>
      <div className="hero-wrp">
        <div className="hero-intro">
          <div className="hero-video">
            <VideoComponent src={videoHero} />
          </div>
          <div className="hero-content">
            <h2 className="hero-subheading">
              Meet İstanbul, where the past meets the present amidst historic
              landmarks, vibrant markets, and the enchanting Bosphorus—a
              traveler's dream.
            </h2>
            <Link to="/tours">
              <div className="hero-slogan">
                <div className="hero-slogan-wrp">
                  <img src={sloganImg} alt="slogan" />
                </div>
                <Button
                  className="btn--cta"
                  iconUrl={arrowUpRightIcon}
                  iconClassName="btn--icon"
                >
                  View all tours
                </Button>
              </div>
            </Link>
          </div>
        </div>
        <div className="hero-categories">
          <div className="hero-category">
            <img src={guidedImg} alt="culinary tours" />
            <div className="overlay--category"></div>
            <Button
              className="btn--culinary"
              iconUrl={arrowUpRightIcon}
              iconClassName="btn--icon"
              to="/tours?category=Guided tour"
            >
              Guided tours
            </Button>
          </div>
          <div className="hero-category">
            <img src={culinaryImg} alt="culinary tours" />
            <div className="overlay--category"></div>

            <Button
              className="btn--culinary"
              iconUrl={arrowUpRightIcon}
              iconClassName="btn--icon"
              to="/tours?category=Culinary tour"
            >
              Culinary tours
            </Button>
          </div>
          <div className="hero-category">
            <img src={experiencesImg} alt="culinary tours" />
            <div className="overlay--category"></div>

            <Button
              className="btn--culinary"
              iconUrl={arrowUpRightIcon}
              iconClassName="btn--icon"
              to="/tours?category=Experience"
            >
              Experiences
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
