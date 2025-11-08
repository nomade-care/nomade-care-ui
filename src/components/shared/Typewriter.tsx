'use client';

import { useState, useEffect } from 'react';

interface TypewriterProps {
  staticText?: string;
  typedText: string;
  speed?: number;
  className?: string;
}

export function Typewriter({ staticText = '', typedText, speed = 20, className = '' }: TypewriterProps) {
  const [displayedTypedText, setDisplayedTypedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < typedText.length) {
      const timer = setTimeout(() => {
        setDisplayedTypedText(prev => prev + typedText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, typedText, speed]);

  useEffect(() => {
    setDisplayedTypedText('');
    setCurrentIndex(0);
  }, [typedText]);

  return (
    <span className={className}>
      {staticText}{displayedTypedText}
    </span>
  );
}