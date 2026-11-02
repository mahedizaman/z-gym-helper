'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/language-context';

interface CountUpProps {
  end: number;
  start?: number;
  duration?: number; // seconds
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
  toBengaliDigits?: boolean;
}

export function CountUp({
  end,
  start = 0,
  duration = 2,
  prefix = '',
  suffix = '',
  className,
  decimals = 0,
  toBengaliDigits = false,
}: CountUpProps) {
  const [value, setValue] = useState(start);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const { isBangla } = useLanguage();

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = start + (end - start) * easeProgress;
      
      setValue(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setValue(end);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isInView, end, start, duration]);

  const formattedNum = value.toFixed(decimals);

  const convertToBengali = (numStr: string) => {
    const bengaliDigits: Record<string, string> = {
      '0': '০',
      '1': '১',
      '2': '২',
      '3': '৩',
      '4': '৪',
      '5': '৫',
      '6': '৬',
      '7': '৭',
      '8': '৮',
      '9': '৯',
      '.': '.',
    };
    return numStr.replace(/[0-9]/g, (w) => bengaliDigits[w] || w);
  };

  const displayString = (toBengaliDigits || isBangla) 
    ? convertToBengali(formattedNum) 
    : formattedNum;

  return (
    <span ref={ref} className={cn('tabular-nums font-display font-extrabold', className)}>
      {prefix}
      {displayString}
      {suffix}
    </span>
  );
}
