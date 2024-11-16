import { Link } from "react-router-dom";
// import "./Button.css";

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
    <Link
      to={to}
      className={`rounded-md bg-slate-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ml-2 ${className}`}
    >
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
    <button
      className={`rounded-md bg-slate-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ml-2 ${className}`}
      onClick={onClick}
    >
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
