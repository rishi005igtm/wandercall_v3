'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Play, Pause } from 'lucide-react';

interface AudioMessagePlayerProps {
  duration: string;
  compact?: boolean;
}

export function AudioMessagePlayer({ duration, compact = false }: AudioMessagePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const totalSeconds = useMemo(() => {
    const parts = duration.split(':');
    const minutes = parseInt(parts[0] || '0', 10);
    const seconds = parseInt(parts[1] || '0', 10);
    return minutes * 60 + seconds || 10;
  }, [duration]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.1;
          if (next >= totalSeconds) {
            setIsPlaying(false);
            setProgress(100);
            return totalSeconds;
          }
          setProgress((next / totalSeconds) * 100);
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalSeconds]);

  const handlePlayToggle = () => {
    if (currentTime >= totalSeconds) {
      setCurrentTime(0);
      setProgress(0);
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const containerWidth = compact ? 'w-52' : 'w-64';

  return (
    <div
      className={`bg-white/5 border border-white/5 p-3 rounded-2xl rounded-tl-none flex items-center gap-3 ${containerWidth}`}
    >
      <button
        onClick={handlePlayToggle}
        className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all ${
          isPlaying
            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_10px_rgba(239,68,68,0.15)]'
            : 'bg-brand-cyan text-zinc-950 shadow-md shadow-brand-cyan/10'
        }`}
        aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
      >
        {isPlaying ? (
          <Pause className="h-3.5 w-3.5 fill-current" />
        ) : (
          <Play className="h-3.5 w-3.5 fill-current" />
        )}
      </button>

      <div className="flex-1 h-6 relative flex items-center overflow-hidden select-none">
        {isPlaying ? (
          <>
            <svg
              viewBox="0 0 300 24"
              className="absolute left-0 w-[300px] h-full text-zinc-800 pointer-events-none"
            >
              <path
                d="M 0 12 Q 10 2, 20 12 T 40 12 T 60 12 T 80 12 T 100 12 T 120 12 T 140 12 T 160 12 T 180 12 T 200 12 T 220 12 T 240 12 T 260 12 T 280 12 T 300 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="animate-snake-wave"
              />
            </svg>
            <div
              className="absolute left-0 h-full overflow-hidden pointer-events-none"
              style={{ width: `${progress}%` }}
            >
              <svg viewBox="0 0 300 24" className="w-[300px] h-full text-brand-cyan">
                <path
                  d="M 0 12 Q 10 2, 20 12 T 40 12 T 60 12 T 80 12 T 100 12 T 120 12 T 140 12 T 160 12 T 180 12 T 200 12 T 220 12 T 240 12 T 260 12 T 280 12 T 300 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="animate-snake-wave"
                />
              </svg>
            </div>
          </>
        ) : (
          <>
            <div className="absolute left-0 right-0 h-0.5 bg-zinc-800 rounded-full" />
            <div
              className="absolute left-0 h-0.5 bg-brand-cyan rounded-full"
              style={{ width: `${progress}%` }}
            />
          </>
        )}
      </div>

      <span className="text-[9px] font-mono text-zinc-500 shrink-0 select-none">
        {isPlaying ? formatTime(currentTime) : duration}
      </span>
    </div>
  );
}
