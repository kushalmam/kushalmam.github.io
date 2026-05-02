const setSlowPlayback = (video: HTMLVideoElement | null) => {
  if (video) {
    video.playbackRate = 0.55;
  }
};

const SiteBackground = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-40 overflow-hidden bg-background"
    >
      <video
        ref={setSlowPlayback}
        className="site-video-background"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src="/videos/pexels-fluid-motion.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 site-video-color-grade" />
      <div className="absolute inset-0 site-video-readability-mask" />
      <div className="absolute inset-0 grain-layer" />
    </div>
  );
};

export default SiteBackground;
