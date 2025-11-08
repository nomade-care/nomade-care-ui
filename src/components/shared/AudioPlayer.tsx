'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { Waveform } from './Waveform';
import { Button } from '../ui/button';

type AudioPlayerProps = {
  audioUrl: string;
  waveform: number[];
  colorClass?: string;
};

export function AudioPlayer({ audioUrl, waveform, colorClass = "text-primary" }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(audioUrl);
    
    const currentAudioRef = audioRef.current;

    const handleEnded = () => setIsPlaying(false);
    currentAudioRef.addEventListener('ended', handleEnded);

    return () => {
      currentAudioRef.pause();
      currentAudioRef.removeEventListener('ended', handleEnded);
      audioRef.current = null;
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className={`flex items-center gap-3 ${colorClass}`}>
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlayPause}
        aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
      >
        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
      </Button>
      <div className="h-10 flex-1">
        <Waveform data={waveform} />
      </div>
    </div>
  );
}
