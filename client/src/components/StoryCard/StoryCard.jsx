import "./StoryCard.scss";
const StoryCard = ({ article }) => {
  console.log("Story card article:", article);
  if (!article.length) {
    return <div>Loading...</div>;
  }
  const API_URL = import.meta.env.VITE_API_KEY;
  const { title, images, category, date_posted, read_time, description } =
    article[0];
  return (
    <div className="story-card">
      <div className="story-img">
        <img src={`${API_URL}/articles/${images[0]}`} alt="story image" />
      </div>

      <div className="story-content">
        <span className="story-tag">{category}</span>
        <h4 className="story-heading">{title}</h4>
        <span className="story-timestamp">
          {date_posted} - {read_time} min read
        </span>
        <p className="story-desc">{description}</p>
      </div>
    </div>
  );
};

export default StoryCard;
