'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { generateWaveform } from '@/lib/waveform';

type WaveformProps = {
  data: number[];
  className?: string;
  barWidth?: number;
  gap?: number;
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
