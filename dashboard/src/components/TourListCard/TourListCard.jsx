import { Link, useNavigate } from "react-router-dom";
import EditIcon from "../ui/SVGIcons/EditIcon";
import Icon from "../ui/SVGIcons/Icon";
import { scheduleIconPath } from "../ui/SVGIcons/iconPaths";
import Button from "../ui/Button/Button";

const TourListCard = ({
  tour_image,
  tour_name,
  duration,
  price,
  slug,
  category,
}) => {
  const API_URL = import.meta.env.VITE_API_KEY;
  console.log(tour_name, duration, price, slug);
  const navigate = useNavigate();
  return (
    <Link
      to={`/tours/${slug}`}
      className="relative w-80 h-80 list-card text-sm flex flex-col rounded-md overflow-hidden shadow-md"
    >
      <div className="absolute top-2 right-2 rounded-md flex items-center bg-green-100 py-0.5 px-2.5 border border-transparent text-sm text-green-800 transition-all shadow-sm">
        <div className="mx-auto block h-2 w-2 rounded-full bg-green-800 mr-2"></div>
        Active
      </div>
      <div className="w-full h-full ">
        <img
          className="h-32 "
          src={`${API_URL}/${tour_image}`}
          alt="tour main image"
        />
      </div>
      <div className="flex flex-col justify-between  h-full p-4">
        <h2 className="text-base font-medium">{tour_name}</h2>
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <div className="flex gap-2 items-center ">
              <Icon
                iconPath={scheduleIconPath}
                className="w-4 h-4 fill-brandMaroon"
              />
              <span className="leading-none text-sm">{duration}</span>
            </div>
            <div
              className={`rounded-md flex items-center  py-0.5 px-2.5 border border-transparent text-sm  transition-all shadow-sm ${
                category === "Guided tour"
                  ? "bg-brandPurple text-brandDarkPurple"
                  : category === "Culinary tour"
                  ? "bg-brandOrange text-brandDarkOrange"
                  : "bg-brandRed text-brandDarkRed"
              } `}
            >
              {category}
            </div>
          </div>
          <span className="leading-none text-sm">USD {price}</span>
        </div>

        <div className="flex justify-end p-2">
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(`/tours/${slug}/edit`);
            }}
            className=""
          >
            {/* <EditIcon /> */}
            Edit Tour
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default TourListCard;
