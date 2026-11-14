import { useEffect, useRef, useState } from "react";
import "./VideoComponent.scss";

// Silent looping video.
// - `poster` is shown straight away, so there is no empty box while loading.
// - `lazy` videos only download when they are about to scroll into view and
//   pause again when they leave it (saves data and battery on long pages).
const VideoComponent = ({
  className = "",
  src,
  speed = 1.0,
  poster,
  lazy = false,
}) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!lazy);

  useEffect(() => {
    if (!lazy) return;
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShouldLoad(true);
        const video = videoRef.current;
        if (!video) return;
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [lazy]);

  const handleLoadedData = () => {
    setIsLoaded(true);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const visible = isLoaded || Boolean(poster);

  return (
    <div ref={containerRef} className={`video-container ${className}`}>
      {!visible && <div className="video-skeleton"></div>}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload={lazy ? "none" : "auto"}
        poster={poster}
        className={`video ${visible ? "visible" : "hidden"}`}
        onLoadedData={handleLoadedData}
      >
        {shouldLoad && <source src={src} type="video/mp4" />}
      </video>
    </div>
  );
};

export default VideoComponent;
