import "./Hero.scss";
import videoHero from "../../assets/videos/newcool381sec230516webyk2.mp4";
import VideoComponent from "../VideoComponent/VideoComponent";
import { Link } from "react-router-dom";
import culinaryImg from "../../assets/images/culinarytours.webp";
import Button from "../Button/Button";
import sloganImg from "../../assets/icons/slogan.svg";
import guidedImg from "../../assets/images/guided.jpg";
import experiencesImg from "../../assets/images/experiences.jpg";
import arrowUpRightIcon from "../../assets/icons/arrow-up-right.svg";

const Hero = () => {
  return (
    <section className="hero">
      <h1 className="hero-heading">Guided tours: Discover Majestic İstanbul</h1>
      <div className="hero-wrp">
        <div className="hero-intro">
          <div className="hero-video">
            <VideoComponent src={videoHero} speed="0.8" />
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
                <Button className="btn btn--cta" iconClassName="btn--icon">
                  View all tours
                </Button>
              </div>
            </Link>
          </div>
        </div>
        <div className="hero-categories">
          <Link className="hero-category" to="/tours?category=Guided tour">
            <div className="hero-category-cta">
              <div className="hero-category-img">
                <img src={guidedImg} alt="guided tours" />
              </div>
              <div className="overlay--category-guided overlay--category">
                <Button
                  className="btn btn--category"
                  iconUrl={arrowUpRightIcon}
                  iconClassName="btn--icon btn--icon-guided"
                >
                  Guided tours
                </Button>
              </div>
            </div>
          </Link>
          <Link className="hero-category" to="/tours?category=Culinary tour">
            <div className="hero-category-cta">
              <div className="hero-category-img">
                <img src={culinaryImg} alt="culinary tours" />
              </div>

              <div className="overlay--category-culinary overlay--category">
                <Button
                  className="btn btn--category"
                  iconUrl={arrowUpRightIcon}
                  iconClassName="btn--icon btn--icon-culinary"
                >
                  Culinary visits
                </Button>
              </div>
            </div>
          </Link>
          <Link className="hero-category" to="/tours?category=Experience">
            <div className="hero-category-cta">
              <div className="hero-category-img">
                <img src={experiencesImg} alt="experiences tours" />
              </div>

              <div className="overlay--category-experiences overlay--category">
                <Button
                  className="btn btn--category"
                  iconUrl={arrowUpRightIcon}
                  iconClassName="btn--icon btn--icon-experiences"
                >
                  Experiences
                </Button>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
