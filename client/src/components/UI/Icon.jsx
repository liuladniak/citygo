import "./Icon.scss";

const Icon = ({ iconPath, className = "", pathClassName = "" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 -960 960 960"
      width="24px"
      className={`${className}`}
    >
      <path className={pathClassName} d={iconPath} />
    </svg>
  );
};

export default Icon;
