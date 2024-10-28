import Button from "../Button/Button";
import "./MoreServices.scss";

const MoreServices = () => {
  return (
    <section className="more-services">
      <div className="transfers service">
        <h2 className="service__heading">Transfers</h2>
        <div className="service-wrp">
          <p className="service__desc">
            Private & Legal Airport Transportation Service in Istanbul. Safe and
            Economic Transport.
          </p>
          <Button
            className="btn btn--cta"
            iconClassName="btn--icon"
            text="See all Car Services"
          />
        </div>
        <div className="overlay--more"></div>
      </div>
      <div className="private">
        <h2 className="service__heading">Private tours</h2>
        <div className="service-wrp">
          <p className="service__desc">
            Discover Istanbul with exclusive private tours: tailored
            itineraries, personalized experiences, and dedicated guides.
          </p>

          <Button
            className="btn btn--cta"
            iconClassName="btn--icon"
            text="View how it works"
          />
        </div>
        <div className="overlay--more"></div>
      </div>
    </section>
  );
};

export default MoreServices;
