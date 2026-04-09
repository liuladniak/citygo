import { formatDateTime } from "../../utils/formatDateTime";
import "./StoryCardSmall.scss";
const StoryCardSmall = ({ articles, articleIndex }) => {
  if (!articles.length) {
    return <div>Loading...</div>;
  }
  const { title, images, category, date_posted, read_time } =
    articles[articleIndex];
  return (
    <div className="story-sm-card">
      <div className="story-sm-img">
        <img src={images[0]?.url} alt="story image" />
      </div>

      <div className="story-sm-content">
        <span className="story-sm-tag">{category}</span>
        <h4 className="story-sm-heading">{title}</h4>
        <span className="story-sm-timestamp">
          {formatDateTime(date_posted)} - {read_time} min read
        </span>
      </div>
    </div>
  );
};

export default StoryCardSmall;
