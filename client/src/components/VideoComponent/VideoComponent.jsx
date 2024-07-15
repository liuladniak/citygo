import { useRef, useEffect } from "react";

const VideoComponent = ({ src, speed = 1.0 }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, [speed]);

  return (
    <video ref={videoRef} autoPlay loop muted className="video">
      <source src={src} />
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoComponent;
