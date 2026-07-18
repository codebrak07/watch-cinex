import React, { useRef, useState } from 'react';

export default function Timeline({ currentTime, duration, bufferedTime, onChangeTime }) {
  const timelineRef = useRef(null);
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverX, setHoverX] = useState(0);

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleMouseMove = (e) => {
    const rect = timelineRef.current.getBoundingClientRect();
    const percent = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setHoverTime(percent * duration);
    setHoverX(e.clientX - rect.left);
  };

  const handleMouseLeave = () => {
    setHoverTime(null);
  };

  const handleClick = (e) => {
    const rect = timelineRef.current.getBoundingClientRect();
    const percent = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    if (onChangeTime) {
      onChangeTime(percent * duration);
    }
  };

  // Markers positions
  const introStart = 90;
  const introEnd = 180;
  const creditsStart = duration > 120 ? duration - 60 : 3540;

  return (
    <div className="space-y-2 select-none">
      <div 
        ref={timelineRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="relative h-2 w-full bg-white/20 rounded-full cursor-pointer group transition-all duration-300 hover:h-3"
      >
        {/* Buffered Progress */}
        <div 
          className="absolute top-0 bottom-0 left-0 bg-white/30 rounded-full transition-all duration-300"
          style={{ width: `${(bufferedTime / (duration || 3600)) * 100}%` }}
        />
        
        {/* Played Progress */}
        <div 
          className="absolute top-0 bottom-0 left-0 bg-[#ff4d85] rounded-full"
          style={{ width: `${(currentTime / (duration || 3600)) * 100}%` }}
        />

        {/* Hover Time Preview Box */}
        {hoverTime !== null && (
          <div 
            className="absolute bottom-6 bg-[#121318] text-white border border-white/10 px-2 py-1 rounded text-[10px] font-mono shadow-xl -translate-x-1/2 pointer-events-none"
            style={{ left: `${hoverX}px` }}
          >
            {formatTime(hoverTime)}
          </div>
        )}

        {/* Markers */}
        {/* Intro Section Marker (Yellow) */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-yellow-400 opacity-60"
          style={{ left: `${(introStart / (duration || 3600)) * 100}%` }}
          title="Intro Start"
        />
        <div 
          className="absolute top-0 bottom-0 w-1 bg-yellow-400 opacity-60"
          style={{ left: `${(introEnd / (duration || 3600)) * 100}%` }}
          title="Intro End"
        />

        {/* Credits Section Marker (Teal) */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-teal-400 opacity-60"
          style={{ left: `${(creditsStart / (duration || 3600)) * 100}%` }}
          title="Credits Start"
        />
      </div>

      <div className="flex justify-between items-center text-xs font-mono text-neutral-400">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration || 3600)}</span>
      </div>
    </div>
  );
}
