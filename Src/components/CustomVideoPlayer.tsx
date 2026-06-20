import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';

interface CustomVideoPlayerProps {
  src: string;
  className?: string;
  poster?: string;
}

export default function CustomVideoPlayer({ src, className = '', poster }: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Auto hide controls after inactivity
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      return;
    }
    const delay = setTimeout(() => {
      setShowControls(false);
    }, 2500);

    return () => clearTimeout(delay);
  }, [isPlaying, showControls]);

  // Format time util
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return '0:00';
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(err => console.log("Play interrupted", err));
      setIsPlaying(true);
    }
    setShowControls(true);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration || 1;
    setProgress((current / total) * 100);
    setCurrentTime(formatTime(current));
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(formatTime(videoRef.current.duration));
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPositionRelative = (e.clientX - rect.left) / rect.width;
    const newTime = clickPositionRelative * videoRef.current.duration;
    if (!isNaN(newTime)) {
      videoRef.current.currentTime = newTime;
      setProgress(clickPositionRelative * 100);
    }
  };

  const handleMuteUnmute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    setShowControls(true);
  };

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(err => console.log(err));
    setIsPlaying(true);
  };

  return (
    <div
      id="custom-video-container"
      className={`relative overflow-hidden rounded-xl bg-black group select-none ${className}`}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain max-h-[60vh]"
        onClick={handlePlayPause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        playsInline
      />

      {/* Visual Big Center Play/Pause Indicator (Fades Out) */}
      <div
        id="center-play-overlay"
        onClick={handlePlayPause}
        className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity cursor-pointer duration-300"
      >
        {!isPlaying && (
          <div className="p-5 rounded-full bg-violet-600/90 text-white shadow-2xl hover:scale-110 transition-transform duration-200">
            <Play className="w-8 h-8 fill-current translate-x-0.5" />
          </div>
        )}
      </div>

      {/* Control Overlay HUD */}
      <div
        id="video-controls-overlay"
        className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/70 to-transparent transition-opacity duration-300 flex flex-col gap-3 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Timeline Progress bar */}
        <div
          id="video-timeline-scrub"
          className="relative h-2 bg-zinc-700/80 rounded-full cursor-pointer hover:h-3 transition-[height] duration-200"
          onClick={handleTimelineClick}
        >
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-[50%] -translate-y-1/2 w-4 h-4 bg-white border border-violet-500 shadow-md rounded-full scale-0 group-hover:scale-100 transition-transform duration-200"
            style={{ left: `calc(${progress}% - 8px)` }}
          />
        </div>

        {/* Play/Pause, Duration & Volume Panel */}
        <div id="video-actions-toolbar" className="flex items-center justify-between mt-1 text-zinc-200 text-sm font-mono leading-none">
          <div id="video-actions-left" className="flex items-center gap-4">
            <button
              id="video-toggle-play"
              onClick={handlePlayPause}
              className="p-1 hover:text-white transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current" />
              )}
            </button>

            <button
              id="video-replay"
              onClick={handleReplay}
              className="p-1 hover:text-white transition-colors"
              title="Restart Video"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <span id="video-playback-time">
              {currentTime} <span className="text-zinc-500">/</span> {duration}
            </span>
          </div>

          <div id="video-actions-right">
            <button
              id="video-toggle-volume"
              onClick={handleMuteUnmute}
              className="p-1 hover:text-white transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-fuchsia-400" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
