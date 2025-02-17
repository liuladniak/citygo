import { useRef, useEffect, useState } from "react";
import "./VideoComponent.scss";
const VideoComponent = ({ className, src, speed = 1.0 }) => {
  const videoRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoadedData = () => {
    setIsLoaded(true);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  return (
    <div className={`video-container ${className}`}>
      {!isLoaded && <div className="video-skeleton"></div>}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        className={`video ${isLoaded ? "visible" : "hidden"} `}
        onLoadedData={handleLoadedData}
      >
        <source src={src} />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoComponent;
