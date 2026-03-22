import React, { useState, useEffect } from 'react';

interface TypewriterLabelProps {
  text: string;
  suffix?: React.ReactNode;
  delay?: number;
  className?: string;
}

export function TypewriterLabel({ text, suffix = null, delay = 0, className = "" }: TypewriterLabelProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let i = 0;
    let timeoutId: NodeJS.Timeout;

    const type = () => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i > text.length) {
        setIsTyping(false);
      } else {
        setIsTyping(true);
        timeoutId = setTimeout(type, 30); // Typing speed
      }
    };

    const initialTimer = setTimeout(() => {
      setIsTyping(true);
      type();
    }, delay);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(timeoutId);
    };
  }, [text, delay]);

  return (
    <span className={className}>
      {displayedText}
      {suffix}
      <span className={`ml-[2px] inline-block w-[2px] h-[1em] bg-emerald-500 align-middle ${isTyping ? 'animate-pulse' : 'opacity-0'}`}></span>
    </span>
  );
}
