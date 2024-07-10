import "./WhyUsCard.scss";

const WhyUsCard = ({ data }) => {
  return (
    <div className="why-us-card">
      <img className="why-us-icon" src={data.icon} alt="icon" />
      <div className="why-us-text">
        <h4 className="why-us-title">{data.title}</h4>
        <p className="why-us-desc">{data.desc}</p>
      </div>
    </div>
  );
};

export default WhyUsCard;
