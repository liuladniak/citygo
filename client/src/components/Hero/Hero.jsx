// import "./Hero.scss";
// import videoHero from "../../assets/videos/newcool381sec230516webyk2.mp4";
// import VideoComponent from "../VideoComponent/VideoComponent";
// import { Link } from "react-router-dom";
// import culinaryImg from "../../assets/images/culinarytours.webp";
// import Button from "../Button/Button";
// import sloganImg from "../../assets/icons/slogan.svg";
// import guidedImg from "../../assets/images/guided.webp";
// import experiencesImg from "../../assets/images/experiences.webp";
// import arrowUpRightIcon from "../../assets/icons/arrow-up-right.svg";

// const Hero = () => {
//   return (
//     <section className="hero">
//       <h1 className="hero-heading">Discover Majestic İstanbul</h1>
//       <div className="hero-wrp">
//         <div className="hero-intro">
//           <div className="hero-video">
//             <VideoComponent src={videoHero} speed="0.8" />
//           </div>
//           <div className="hero-content">
//             <p className="hero-subheading">
//               Where history, vibrant markets, and the Bosphorus create a
//               traveler's dream{" "}
//               <span className="hero-subheading__accent">✦</span>
//             </p>
//             <Link to="/tours">
//               <div className="hero-slogan">
//                 <div className="hero-slogan-wrp">
//                   <img src={sloganImg} alt="slogan" />
//                 </div>
//                 <Button
//                   className="btn btn--cta"
//                   iconClassName="btn--icon"
//                   text="Explore tours"
//                 />
//               </div>
//             </Link>
//           </div>
//         </div>
//         <div className="hero-categories">
//           <Link className="hero-category" to="/tours?category=Guided tour">
//             <div className="hero-category-cta">
//               <div className="hero-category-img">
//                 <img src={guidedImg} alt="guided tours" loading="lazy" />
//               </div>
//               <div className="overlay--category-guided overlay--category">
//                 <Button
//                   className="btn btn--category"
//                   iconUrl={arrowUpRightIcon}
//                   iconClassName="btn--icon btn--icon-guided"
//                   text="City"
//                 />
//               </div>
//             </div>
//           </Link>
//           <Link className="hero-category" to="/tours?category=Culinary tour">
//             <div className="hero-category-cta">
//               <div className="hero-category-img">
//                 <img src={culinaryImg} alt="culinary tours" loading="lazy" />
//               </div>

//               <div className="overlay--category-culinary overlay--category">
//                 <Button
//                   className="btn btn--category"
//                   iconUrl={arrowUpRightIcon}
//                   iconClassName="btn--icon btn--icon-culinary"
//                   text="Food"
//                 />
//               </div>
//             </div>
//           </Link>
//           <Link className="hero-category" to="/tours?category=Experience">
//             <div className="hero-category-cta">
//               <div className="hero-category-img">
//                 <img
//                   src={experiencesImg}
//                   alt="experiences tours"
//                   loading="lazy"
//                 />
//               </div>

//               <div className="overlay--category-experiences overlay--category">
//                 <Button
//                   className="btn btn--category"
//                   iconUrl={arrowUpRightIcon}
//                   iconClassName="btn--icon btn--icon-experiences"
//                   text="Activities"
//                 />
//               </div>
//             </div>
//           </Link>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Hero;
import "./Hero.scss";
import videoHero from "../../assets/videos/newcool381sec230516webyk2.mp4";
import VideoComponent from "../VideoComponent/VideoComponent";
import { Link } from "react-router-dom";
import culinaryImg from "../../assets/images/culinarytours.webp";
import Button from "../Button/Button";
import guidedImg from "../../assets/images/guided.webp";
import experiencesImg from "../../assets/images/experiences.webp";
import arrowUpRightIcon from "../../assets/icons/arrow-up-right.svg";

const Hero = () => {
  return (
    <section className="hero">
      <h1 className="hero-heading">Discover Majestic İstanbul</h1>
      <div className="hero-wrp">
        <div className="hero-intro">
          <div className="hero-video">
            <VideoComponent src={videoHero} speed="0.8" />
          </div>
          <div className="hero-content">
            <p className="hero-subheading">
              Where history, vibrant markets, and the Bosphorus create a
              traveler's dream{" "}
              <span className="hero-subheading__accent">✦</span>
            </p>
            <Link to="/tours" className="hero-cta-card">
              <span className="hero-cta-card__eyebrow">İstanbul awaits</span>
              <div className="hero-cta-card__body">
                <div className="hero-cta-card__number">35+</div>
                <div className="hero-cta-card__title">tours to choose from</div>
                <p className="hero-cta-card__desc">
                  From Bosphorus cruises to bazaar walks, find the one made for
                  you.
                </p>
              </div>
              <Button
                className="btn btn--cta"
                iconClassName="btn--icon"
                text="Explore tours"
              />
            </Link>
          </div>
        </div>
        <div className="hero-categories">
          <Link className="hero-category" to="/tours?category=Guided tour">
            <div className="hero-category-cta">
              <div className="hero-category-img">
                <img src={guidedImg} alt="guided tours" loading="lazy" />
              </div>
              <div className="overlay--category-guided overlay--category">
                <Button
                  className="btn btn--category"
                  iconUrl={arrowUpRightIcon}
                  iconClassName="btn--icon btn--icon-guided"
                  text="City"
                />
              </div>
            </div>
          </Link>
          <Link className="hero-category" to="/tours?category=Culinary tour">
            <div className="hero-category-cta">
              <div className="hero-category-img">
                <img src={culinaryImg} alt="culinary tours" loading="lazy" />
              </div>
              <div className="overlay--category-culinary overlay--category">
                <Button
                  className="btn btn--category"
                  iconUrl={arrowUpRightIcon}
                  iconClassName="btn--icon btn--icon-culinary"
                  text="Food"
                />
              </div>
            </div>
          </Link>
          <Link className="hero-category" to="/tours?category=Experience">
            <div className="hero-category-cta">
              <div className="hero-category-img">
                <img
                  src={experiencesImg}
                  alt="experiences tours"
                  loading="lazy"
                />
              </div>
              <div className="overlay--category-experiences overlay--category">
                <Button
                  className="btn btn--category"
                  iconUrl={arrowUpRightIcon}
                  iconClassName="btn--icon btn--icon-experiences"
                  text="Activities"
                />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
