import { Link } from "react-router-dom";
import "./Button.scss";

function Button({
  text,
  children,
  iconUrl,
  to,
  onClick,
  className = "",
  textClassName = "",
  iconClassName = "",
  type = "",
}) {
  const textContent = children || (
    <span className={`btn__text ${textClassName}`}>{text}</span>
  );

  return to ? (
    <Link to={to} className={`btn ${className}`}>
      {textContent}
      {iconUrl && (
        <img
          className={`btn__icon ${iconClassName}`}
          src={iconUrl}
          alt="Button icon"
        />
      )}
    </Link>
  ) : (
    <button className={`btn ${className}`} onClick={onClick} type={type}>
      <span>{textContent}</span>
      {iconUrl && (
        <img
          className={`btn__icon ${iconClassName}`}
          src={iconUrl}
          alt="Button icon"
        />
      )}
    </button>
  );
}

export default Button;
