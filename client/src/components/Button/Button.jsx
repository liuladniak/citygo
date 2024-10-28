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
}) {
  const content = (
    <>
      <span className={`btn__text ${textClassName}`}>{text}</span>
      <span>
        {iconUrl && (
          <img
            className={`btn__icon ${iconClassName}`}
            src={iconUrl}
            alt="Button icon"
          />
        )}
      </span>
    </>
  );
  return to ? (
    <Link to={to} className={`btn ${className}`}>
      {content}
    </Link>
  ) : (
    <button className={`btn ${className}`} onClick={onClick}>
      {content}
    </button>
  );
}

export default Button;
