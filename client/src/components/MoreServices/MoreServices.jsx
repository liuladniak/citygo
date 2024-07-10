import Button from "../Button/Button";
import "./MoreServices.scss";

const MoreServices = () => {
  return (
    <section className="more-services">
      <div className="transfers service">
        <h2 className="service__heading">Transfers</h2>
        <p className="service__desc">
          Private & Legal Airport Transportation Service in Istanbul. Service
          available at Istanbul Airport, Sabiha Gokcen Airport and Cruise Ports
          to the Hotels, Apartments and Special Address . We use Private VIP
          Cars, Minivans, Minibuses. Safe and Economic Transport,
        </p>
        <Button className="btn--cta" iconClassName="btn--icon">
          See all Car Services
        </Button>
        <div className="overlay--more"></div>
      </div>
      <div className="private">
        <h2 className="service__heading">Private tours</h2>
        <p className="service__desc">
          Discover Istanbul with our exclusive private tours. Tailored
          itineraries, personalized experiences, and dedicated guides ensure an
          unforgettable journey.
        </p>

        <Button className="btn--cta" iconClassName="btn--icon">
          View how it works
        </Button>
        <div className="overlay--more"></div>
      </div>
    </section>
  );
};

export default MoreServices;
