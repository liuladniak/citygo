import { useNavigate } from "react-router-dom";
import "./GoBackButton.css";
import arrowBackIcon from "../../../assets/icons/arrowBack.svg";

const BackButton = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <button
      className="back-button bg-transparent border-none cursor-pointer p-0 flex items-center text-inherit hover:opacity-80"
      onClick={handleGoBack}
      aria-label="Go back"
    >
      <img src={arrowBackIcon} alt="Back" />
    </button>
  );
};

export default BackButton;
