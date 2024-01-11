export function toggleMuteAllVideos() {
  const videos = document.querySelectorAll('video');

  videos.forEach(video => {
    video.muted = !video.muted;

    if (!video.muted) {
      video.play();
    }
  });
}

export function autoplayAllVideos(delay = 3000) {
  setTimeout(toggleMuteAllVideos, delay);
}