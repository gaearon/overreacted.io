# Adding Videos to BrainLoop Article

This directory contains the BrainLoop article and supports local video content.

## Video Files

To add videos to this article, place your video files in this directory:

- `brainloop-demo.mp4` - Main platform demo video
- `video-learning-demo.mp4` - Video learning integration demo
- `brainloop-poster.jpg` - Poster image for the main demo video

## Supported Video Formats

The VideoPlayer component supports all standard web video formats:
- MP4 (recommended)
- WebM
- OGV
- MOV

## How to Add Videos

1. **Place your video file** in this directory (e.g., `my-video.mp4`)

2. **Add the video to the article** by inserting this code in the markdown:

```jsx
<div className="my-8">
  <VideoPlayer 
    src="/brainloop/my-video.mp4" 
    title="My Video Title"
    poster="/brainloop/my-poster.jpg" // optional
    className="w-full max-w-4xl mx-auto"
  />
</div>
```

3. **Video Player Features**:
   - Custom controls with play/pause, seek, and volume
   - Auto-hiding controls during playback
   - Responsive design
   - Poster image support
   - Time display
   - Volume control

## Video Optimization Tips

- **Compress videos** to reduce file size while maintaining quality
- **Use MP4 format** for best browser compatibility
- **Keep videos under 50MB** for better loading performance
- **Add poster images** for better visual loading experience
- **Consider multiple resolutions** for different screen sizes

## Example Usage

```jsx
// Simple video
<VideoPlayer src="/brainloop/demo.mp4" />

// Video with title and poster
<VideoPlayer 
  src="/brainloop/demo.mp4" 
  title="Platform Demo"
  poster="/brainloop/poster.jpg"
  className="w-full max-w-2xl mx-auto"
/>
``` 