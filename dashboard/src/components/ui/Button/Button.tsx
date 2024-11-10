import { Link } from "react-router-dom";
import "./Button.scss";

interface ButtonProps {
  children: React.ReactNode;
  iconUrl?: string;
  to?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  textClassName?: string;
  iconClassName?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  iconUrl,
  to,
  onClick,
  className = "",
  textClassName = "",
  iconClassName = "",
}) => {
  return to ? (
    <Link to={to} className={`btn ${className}`}>
      <span className={`btn__text ${textClassName}`}>{children}</span>
      {iconUrl && (
        <img
          className={`btn__icon ${iconClassName}`}
          src={iconUrl}
          alt="Button icon"
        />
      )}
    </Link>
  ) : (
    <button className={`btn ${className}`} onClick={onClick}>
      <span className={`btn__text ${textClassName}`}>{children}</span>
      {iconUrl && (
        <img
          className={`btn__icon ${iconClassName}`}
          src={iconUrl}
          alt="Button icon"
        />
      )}
    </button>
  );
};

export default Button;
