import "./StoryCardSmall.scss";
const StoryCardSmall = ({ articles, articleIndex }) => {
  if (!articles.length) {
    return <div>Loading...</div>;
  }
  const API_URL = import.meta.env.VITE_API_KEY;
  const { title, images, category, date_posted, read_time } =
    articles[articleIndex];
  return (
    <div className="story-sm-card">
      <div className="story-sm-img">
        <img src={`${API_URL}/articles/${images[0]}`} alt="story image" />
      </div>

      <div className="story-sm-content">
        <span className="story-sm-tag">{category}</span>
        <h4 className="story-sm-heading">{title}</h4>
        <span className="story-sm-timestamp">
          {date_posted} - {read_time} min read
        </span>
      </div>
    </div>
  );
};

export default StoryCardSmall;
