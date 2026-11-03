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
    md: 'w-5 h-6 sm:w-6 sm:h-7',
    lg: 'w-7 h-8 sm:w-8 sm:h-9',
    xl: 'w-9 h-11 sm:w-10 sm:h-12',
  };

  const content = (
    <div
      className={cn(
        'group inline-flex items-center gap-1.5 font-display uppercase select-none font-extrabold leading-none transition-transform duration-200 active:scale-95',
        sizeClasses[size],
        className
      )}
    >
      {/* Unmistakably legible lightning-styled Z and -GYM */}
      <span className="inline-flex items-center tracking-tight font-display font-black">
        <span className="relative inline-flex items-center justify-center text-lime-brand drop-shadow-[0_0_12px_rgba(169,242,107,0.55)]">
          <svg
            className={cn('inline-block fill-lime-brand transition-transform duration-300 group-hover:scale-105', iconSizes[size])}
            viewBox="0 0 24 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Bold Z glyph whose central diagonal is energized with sharp lightning angles */}
            <path
              d="M3 4C3 3.45 3.45 3 4 3H20.5C21.4 3 22 4 21.5 4.8L12.2 15.5H18C18.6 15.5 19.1 16.2 18.8 16.8L13.2 26.5C12.7 27.4 11.3 27 11.4 26L12.2 19H4.5C3.7 19 3.2 18.1 3.7 17.4L10 8.5H4C3.45 8.5 3 8.05 3 7.5V4Z"
              fill="#A9F26B"
              stroke="#0F1412"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* Thunder pink energy core */}
            <path
              d="M17.5 4.5L9.5 14H15L9.5 22.5L15.5 14.5H10.5L17.5 4.5Z"
              fill="#FF2E88"
              opacity="0.9"
            />
          </svg>
        </span>
        <span className="text-foreground tracking-tight font-black ml-1">
          -GYM
        </span>
      </span>

      {showHelper && (
        <span className="hidden sm:inline-flex text-lime-brand text-[0.65em] font-bold px-1.5 py-0.5 rounded-full bg-lime-brand/10 border border-lime-brand/20 ml-0.5 tracking-wider">
          HELPER
        </span>
      )}
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
