'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

type WaveformProps = {
  data: number[];
  className?: string;
  barWidth?: number;
  gap?: number;
};

// A simple deterministic pseudo-random number generator
const mulberry32 = (a: number) => {
    return () => {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

// Function to generate a waveform array from a seed
const generateWaveform = (seed: string, length: number): number[] => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    const random = mulberry32(hash);
    const data = new Array(length);
    let last = 0.5;

    for (let i = 0; i < length; i++) {
        const smoothingFactor = 0.7;
        const next = random();
        last = last * smoothingFactor + next * (1 - smoothingFactor);
        data[i] = last;
    }

    return data;
};


export function Waveform({ data, className, barWidth = 3, gap = 2 }: WaveformProps) {
  const bars = data.length > 0 ? data : generateWaveform('placeholder', 50);

  const width = bars.length * (barWidth + gap) - gap;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} 60`}
      preserveAspectRatio="none"
      className={cn("w-full h-full", className)}
      aria-hidden="true"
    >
      {bars.map((bar, i) => (
        <rect
          key={i}
          x={i * (barWidth + gap)}
          y={30 - (bar * 25)}
          width={barWidth}
          height={bar * 50}
          rx={barWidth / 2}
          ry={barWidth / 2}
          className="fill-current"
        />
      ))}
    </svg>
  );
}
