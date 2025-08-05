'use client'

import { useState, useRef } from 'react'

export default function VideoPlayer({ src, title, poster, className = '', ...props }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const videoRef = useRef(null)
  const controlsTimeoutRef = useRef(null)

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleLoadedMetadata = () => {
    setDuration(videoRef.current.duration)
  }

  const handleTimeUpdate = () => {
    setCurrentTime(videoRef.current.currentTime)
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const width = rect.width
    const seekTime = (clickX / width) * duration
    videoRef.current.currentTime = seekTime
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    videoRef.current.volume = newVolume
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false)
    }
  }

  return (
    <div 
      className={`relative group bg-black rounded-xl overflow-hidden shadow-lg ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-auto"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        {...props}
      />
      
      {/* Custom Controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div 
          className="w-full h-1 bg-white/30 rounded-full cursor-pointer mb-3"
          onClick={handleSeek}
        >
          <div 
            className="h-full bg-white rounded-full transition-all duration-100"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between text-white text-sm">
          <div className="flex items-center space-x-3">
            {/* Play/Pause Button */}
            <button
              onClick={handlePlayPause}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              {isPlaying ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            
            {/* Time Display */}
            <span className="font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.5 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.5l3.883-2.793a1 1 0 011.617.793zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, white 0%, white ${volume * 100}%, rgba(255,255,255,0.3) ${volume * 100}%, rgba(255,255,255,0.3) 100%)`
                }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Title overlay */}
      {title && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4">
          <h3 className="text-white text-lg font-semibold">{title}</h3>
        </div>
      )}
    </div>
  )
} 