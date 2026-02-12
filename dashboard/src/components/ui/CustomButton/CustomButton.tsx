import { Link } from "react-router-dom";
import Icon from "../SVGIcons/Icon";
// import "./Button.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  // IconComponent?: React.FC<React.SVGProps<SVGSVGElement>>;
  IconPath?: string;
  to?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  textClassName?: string;
  iconClassName?: string;
}

const CustomButton: React.FC<ButtonProps> = ({
  children,
  IconPath,
  to,
  // onClick,
  className = "",
  textClassName = "",
  iconClassName = "",
  ...props
}) => {
  const baseStyles =
    "flex items-center justify-center gap-2 rounded-md border border-slate-300 py-2 px-4 text-center text-sm transition-all shadow-xs hover:shadow-lg hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none";

  return to ? (
    <Link to={to} className={`${baseStyles} ${className}`}>
      {IconPath && (
        <Icon iconPath={IconPath} className={`btn__icon ${iconClassName}`} />
      )}
      <span className={`btn__text ${textClassName}`}>{children}</span>
    </Link>
  ) : (
    <button
      className={`${baseStyles} ${className}`}
      // onClick={onClick}
      {...props}
    >
      {IconPath && (
        <Icon iconPath={IconPath} className={`w-6 h-6 ${iconClassName}`} />
      )}
      <span className={`btn__text ${textClassName}`}>{children}</span>
    </button>
  );
};

export default CustomButton;
