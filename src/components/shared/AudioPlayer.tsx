'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { Waveform } from './Waveform';
import { Button } from '../ui/button';


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

        if (isPatientMessage) {
            try {
                const response = await fetch(audioUrl);
                if (!response.ok) throw new Error('Failed to fetch audio');
                const blob = await response.blob();
                const formData = new FormData();
                formData.append('audio_file', blob, 'audio.mp3');

                const apiResponse = await fetch('https://b1f8af9fb6b5.ngrok-free.app/api/audio/analyze', {
                    method: 'POST',
                    body: formData
                });

                if (!apiResponse.ok) throw new Error('API request failed');

                const data = await apiResponse.json();
                const insights = JSON.stringify({
                  staticText: `Detected Emotion: ${data.detected_emotion} (${(data.confidence * 100).toFixed(1)}%)\n\n`,
                  typedText: data.insights
                });

                localStorage.setItem('patientResponse', JSON.stringify({ insights }));
                window.dispatchEvent(new StorageEvent('storage', { key: 'patientResponse', newValue: JSON.stringify({ insights }) }));
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
