const VideoComponent = ({ src }) => {
  return (
    <video autoPlay loop muted className="video">
      <source src={src} />
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoComponent;
