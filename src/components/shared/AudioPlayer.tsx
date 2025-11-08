'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { Waveform } from './Waveform';
import { Button } from '../ui/button';
import { analyzePatientAudio } from '@/lib/actions';
import { usePathname } from 'next/navigation';

type AudioPlayerProps = {
  audioUrl: string;
  waveform: number[];
  colorClass?: string;
  isPatientMessage?: boolean;
};

export function AudioPlayer({ audioUrl, waveform, colorClass = "text-primary", isPatientMessage = false }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
    audioRef.current = new Audio(audioUrl);
    const audio = audioRef.current;

    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlayPause = async () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        if(audioRef.current.ended) {
          audioRef.current.currentTime = 0;
        }
        await audioRef.current.play();
        setIsPlaying(true);
        
        if (isPatientMessage && pathname.includes('/patient')) {
            try {
                await analyzePatientAudio(audioUrl);
            } catch (error) {
                console.error("Failed to analyze audio:", error);
            }
        }
      }
    }
  };

  if (!isMounted) {
    return (
        <div className={`flex items-center gap-3 ${colorClass}`}>
            <Button
                variant="ghost"
                size="icon"
                aria-label={'Play audio'}
                disabled={true}
            >
                <Play className="h-6 w-6" />
            </Button>
            <div className="h-10 flex-1">
                <Waveform data={waveform} />
            </div>
        </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${colorClass}`}>
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlayPause}
        aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
        disabled={!audioUrl}
      >
        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
      </Button>
      <div className="h-10 flex-1">
        <Waveform data={waveform} />
      </div>
    </div>
  );
}
