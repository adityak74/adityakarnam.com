import React from "react";

interface LazyVideoProps {
  src: string;
  poster?: string;
  width?: string | number;
  style?: React.CSSProperties;
  controls?: boolean;
  className?: string;
}

const LazyVideo: React.FC<LazyVideoProps> = ({
  src,
  poster = "/static/banner-aditya.png",
  width = "100%",
  style = { maxWidth: "800px", margin: "0 auto", display: "block" },
  controls = true,
  className,
}) => (
  <video
    src={src}
    controls={controls}
    poster={poster}
    width={width}
    style={style}
    className={className}
  >
    Sorry, your browser doesn't support embedded videos.
  </video>
);

export default LazyVideo;
