type IconProps = {
  fill?: string;
  size?: number;
  className?: string;
  iconPath: string;
};

const Icon: React.FC<IconProps> = ({
  fill = "currentColor",
  size = 20,
  className,
  iconPath,
}) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 -960 960 960"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={iconPath} />
    </svg>
  );
};

export default Icon;
