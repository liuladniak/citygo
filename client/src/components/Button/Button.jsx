import { Link } from "react-router-dom";
import "./Button.scss";

function Button({
  children,
  iconUrl,
  to,
  className = "",
  onClick,
  iconClassName = "",
}) {
  const content = (
    <>
      <>{children}</>
      {iconUrl && (
        <img className={`${iconClassName}`} src={iconUrl} alt="Button icon" />
      )}
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
