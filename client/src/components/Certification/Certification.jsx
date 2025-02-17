import "./Certification.scss";
import licenseImg from "../../assets/logos/TURSAB-logo.png";
import awardImg from "../../assets/logos/tripadvisor.webp";
const Certification = () => {
  return (
    <div className="license">
      <div className="license-card">
        <img className="license-img" src={licenseImg} alt="license logo" />
      </div>
      <div className="license-card">
        <img className="license-img" src={awardImg} alt="license logo" />
      </div>
    </div>
  );
};

export default Certification;
