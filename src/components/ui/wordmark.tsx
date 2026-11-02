import React from 'react';
import Link from 'next/link';
import { APP_CONFIG } from '@/config/app';
import { cn } from '@/lib/utils';

interface WordmarkProps {
  className?: string;
  showHelper?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  asLink?: boolean;
}

export function Wordmark({
  className,
  showHelper = true,
  size = 'md',
  asLink = true,
}: WordmarkProps) {
  const sizeClasses = {
    sm: 'text-lg tracking-tight',
    md: 'text-2xl tracking-normal',
    lg: 'text-3xl tracking-wide',
    xl: 'text-4xl md:text-5xl tracking-wide',
  };

  const iconSizes = {
    sm: 'w-4 h-5',
    md: 'w-6 h-7',
    lg: 'w-8 h-9',
    xl: 'w-10 h-12',
  };

  const content = (
    <div
      className={cn(
        'group inline-flex items-center gap-1.5 font-display uppercase select-none font-extrabold leading-none transition-transform duration-200 active:scale-95',
        sizeClasses[size],
        className
      )}
    >
      {/* Lightning Bolt Stylized Z */}
      <span className="relative flex items-center justify-center">
        <svg
          className={cn('text-lime-brand transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_12px_rgba(169,242,107,0.6)]', iconSizes[size])}
          viewBox="0 0 24 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Lightning 'Z' polygon */}
          <path
            d="M14.5 1L2 14.5H11.5L9.5 27L22 13.5H12.5L14.5 1Z"
            fill="currentColor"
            stroke="#0F1412"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Subtle interior energy core */}
          <path
            d="M13 5L5.5 13.5H11L9.5 21.5L18.5 14H13L14 5Z"
            fill="#FF2E88"
            opacity="0.9"
          />
        </svg>
      </span>

      {/* Main Brand Text from APP_CONFIG */}
      <span className="flex items-baseline gap-1">
        <span className="text-foreground tracking-tight">
          {APP_CONFIG.shortName.slice(1)} {/* '-GYM' */}
        </span>
        {showHelper && (
          <span className="text-lime-brand text-[0.65em] font-bold px-1.5 py-0.5 rounded-full bg-lime-brand/10 border border-lime-brand/20 ml-0.5 tracking-wider">
            HELPER
          </span>
        )}
      </span>
    </div>
  );

  if (asLink) {
    return (
      <Link href="/" className="focus:outline-none" aria-label={APP_CONFIG.name}>
        {content}
      </Link>
    );
  }

  return content;
}
