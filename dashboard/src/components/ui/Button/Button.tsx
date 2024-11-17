import { Link } from "react-router-dom";
// import "./Button.css";

interface ButtonProps {
  children: React.ReactNode;
  IconComponent?: React.FC<React.SVGProps<SVGSVGElement>>;
  to?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  textClassName?: string;
  iconClassName?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  IconComponent,
  to,
  onClick,
  className = "",
  textClassName = "",
  iconClassName = "",
}) => {
  return to ? (
    <Link
      to={to}
      className={`rounded-md border border-slate-300 py-2 px-4 text-center text-sm transition-all shadow-sm hover:shadow-lg  hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ${className}`}
    >
      <span className={`btn__text ${textClassName}`}>{children}</span>
      {IconComponent && (
        <IconComponent className={`btn__icon ${iconClassName}`} />
      )}
    </Link>
  ) : (
    <button
      className={`flex items-center justify-center gap-2 rounded-md border border-slate-300 py-2 px-4 text-center text-sm transition-all shadow-sm hover:shadow-lg  hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ${className}`}
      onClick={onClick}
    >
      {IconComponent && (
        <IconComponent className={`w-6 h-6 ${iconClassName}`} />
      )}
      <span className={`btn__text ${textClassName}`}>{children}</span>
    </button>
  );
};

export default Button;
