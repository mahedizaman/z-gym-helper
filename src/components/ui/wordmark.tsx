import React from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';
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

  const isWhite = className?.includes('text-white');

  const content = (
    <div
      className={cn(
        'group inline-flex items-center gap-1.5 font-display uppercase select-none font-extrabold leading-none transition-transform duration-200 active:scale-95',
        sizeClasses[size],
        className
      )}
    >
      {/* Unmistakably legible Z-GYM where Z is lime-highlighted with lightning energy */}
      <span className="inline-flex items-center tracking-tight font-display font-black">
        <span className="relative inline-flex items-center text-lime-brand font-display font-black drop-shadow-[0_0_12px_rgba(169,242,107,0.45)]">
          <Zap
            className="w-[0.75em] h-[0.75em] text-lime-brand fill-lime-brand mr-0.5 inline-block"
            aria-hidden="true"
          />
          <span className="font-display font-black text-lime-brand tracking-normal">Z</span>
        </span>
        <span
          className={cn(
            'tracking-tight font-black ml-0.5',
            isWhite ? 'text-white' : 'text-foreground'
          )}
        >
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
