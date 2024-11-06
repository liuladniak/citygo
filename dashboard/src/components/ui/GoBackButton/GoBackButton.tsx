import { useNavigate } from "react-router-dom";
import "./GoBackButton.scss";
import arrowBackIcon from "../../../assets/icons/arrowBack.svg";

const BackButton = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <button className="back-button" onClick={handleGoBack} aria-label="Go back">
      <img src={arrowBackIcon} alt="Back" />
    </button>
  );
};

export default BackButton;
