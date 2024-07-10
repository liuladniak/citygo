import "./WhyUs.scss";
import WhyUsCard from "./WhyUsCard";

import icon1 from "../../assets/icons/icon-1.svg";
import icon2 from "../../assets/icons/icon-2.svg";
import icon3 from "../../assets/icons/icon-3.svg";
import icon4 from "../../assets/icons/icon-4.svg";

const WhyUs = () => {
  let whyUs = [
    {
      icon: icon1,
      title: "Local Guided İstanbul Tours",
      desc: "We work with the most experienced and licensed local guides in each region",
    },
    {
      icon: icon2,
      title: "Easy And Fast Booking",
      desc: "Choose one of our ready made packages and make a booking. Our team will be assisting in a timely manner",
    },
    {
      icon: icon3,
      title: "Best Support 24/7",
      desc: "Our dedicated agents will be in touch with you whenever you need something in İstanbul",
    },
    {
      icon: icon4,
      title: "Worldwide Coverage",
      desc: "You can book your İstanbul Package wherever from you are coming. You can come and join",
    },
  ];

  return (
    <div className="why-us">
      <div className="why-us-wrp">
        {whyUs.map((card, i) => {
          return <WhyUsCard key={i} data={card} />;
        })}
      </div>
    </div>
  );
};

export default WhyUs;
