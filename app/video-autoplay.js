"use client"
import  { useEffect } from 'react';

const VideoAutoplay = () => {
  useEffect(() => {
    const videos = document.querySelectorAll('video');

    videos.forEach(video => {
      if(video.muted){
      video.play().catch(error => console.error('Error trying to autoplay video:', error));
    }
    });
  }, []);

  return null
};

export default VideoAutoplay;