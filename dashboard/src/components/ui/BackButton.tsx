import { useNavigate } from "react-router-dom";
import Icon from "./SVGIcons/Icon";
import { chevronLeftPath } from "./SVGIcons/iconPaths";

interface BackButtonProps {
  to?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ to }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => (to ? navigate(to) : navigate(-1))}
      className="p-2 rounded-lg hover:bg-accent transition-colors"
      aria-label="Go back"
    >
      <Icon iconPath={chevronLeftPath} size={24} className=" stroke-foreground" />
    </button>
  );
};

export default BackButton;
