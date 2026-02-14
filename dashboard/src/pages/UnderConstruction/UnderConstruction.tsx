import Header from "../../components/Header/Header";
import Icon from "../../components/ui/SVGIcons/Icon";
import { toolsIconPath } from "../../components/ui/SVGIcons/iconPaths";

const UnderConstruction = () => {
  return (
    <div className="w-full min-h-screen">
      <div className=" h-full flex justify-center pt-80 gap-4">
        <h1>Page under Construction</h1>

        <Icon iconPath={toolsIconPath} />
      </div>
    </div>
  );
};

export default UnderConstruction;
