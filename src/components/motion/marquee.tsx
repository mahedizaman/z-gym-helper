'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface MarqueeProps {
  children?: React.ReactNode;
  items?: string[];
  direction?: 'left' | 'right';
  speed?: number; // in seconds
  pauseOnHover?: boolean;
  className?: string;
  itemClassName?: string;
}

export function Marquee({
  children,
  items,
  direction = 'left',
  speed = 28,
  pauseOnHover = true,
  className,
  itemClassName,
}: MarqueeProps) {
  return (
    <div
      className={cn(
        'group flex overflow-hidden select-none gap-6 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]',
        className
      )}
    >
      <div
        className={cn(
          'flex shrink-0 items-center justify-around gap-6 min-w-full animate-marquee',
          direction === 'right' && 'direction-reverse',
          pauseOnHover && 'group-hover:[animation-play-state:paused]'
        )}
        style={{
          animationDuration: `${speed}s`,
        }}
      >
        {items ? (
          items.map((item, idx) => (
            <React.Fragment key={`item-1-${idx}`}>
              <span className={cn('whitespace-nowrap font-display text-xl uppercase tracking-wider', itemClassName)}>
                {item}
              </span>
              <span className="text-lime-brand select-none text-sm font-black animate-pulse">✦</span>
            </React.Fragment>
          ))
        ) : (
          children
        )}
      </div>

      {/* Duplicate track for seamless infinite loop */}
      <div
        aria-hidden="true"
        className={cn(
          'flex shrink-0 items-center justify-around gap-6 min-w-full animate-marquee',
          direction === 'right' && 'direction-reverse',
          pauseOnHover && 'group-hover:[animation-play-state:paused]'
        )}
        style={{
          animationDuration: `${speed}s`,
        }}
      >
        {items ? (
          items.map((item, idx) => (
            <React.Fragment key={`item-2-${idx}`}>
              <span className={cn('whitespace-nowrap font-display text-xl uppercase tracking-wider', itemClassName)}>
                {item}
              </span>
              <span className="text-lime-brand select-none text-sm font-black animate-pulse">✦</span>
            </React.Fragment>
          ))
        ) : (
          children
        )}
      </div>
    </div>
  );
}
