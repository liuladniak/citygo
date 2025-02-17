import { useDispatch, useSelector } from "react-redux";
import {
  addFavorite,
  removeFavorite,
} from "../../features/wishlist/wishlistSlice";
import saveIcon from "../../assets/icons/heart.svg";
import saveIconFilled from "../../assets/icons/heart-red-filled.svg";
import "./AddToFavorites.scss";

const AddToFavorites = ({ tour }) => {
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.wishlist.favorites);

  const isLiked = favorites.some((favorite) => favorite.id === tour.id);
  console.log(favorites, isLiked, "wishlist");
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiked) {
      dispatch(removeFavorite(tour.id));
    } else {
      dispatch(addFavorite(tour));
    }
  };

  return (
    <div className="tour-tags-wrp tour__save" onClick={handleClick}>
      <div className="heart-container">
        <img
          src={isLiked ? saveIconFilled : saveIcon}
          alt={isLiked ? "Liked" : "Like"}
          className="heart-icon"
        />
      </div>
    </div>
  );
};

export default AddToFavorites;
