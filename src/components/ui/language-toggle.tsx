'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';
import { cn } from '@/lib/utils';
import { Globe } from 'lucide-react';

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, toggleLocale } = useLanguage();

  return (
    <button
      onClick={toggleLocale}
      className={cn(
        'group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/60 bg-secondary/60 hover:bg-secondary text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-brand',
        className
      )}
      type="button"
      aria-label="Toggle language between Bangla and English"
    >
      <Globe className="w-3.5 h-3.5 text-lime-brand transition-transform duration-300 group-hover:rotate-45" />
      <span className="flex items-center gap-1">
        <span
          className={cn(
            'transition-colors font-bold',
            locale === 'bn' ? 'text-foreground font-black' : 'text-muted-foreground'
          )}
        >
          বাং
        </span>
        <span className="text-muted-foreground/60">/</span>
        <span
          className={cn(
            'transition-colors font-bold',
            locale === 'en' ? 'text-foreground font-black' : 'text-muted-foreground'
          )}
        >
          EN
        </span>
      </span>
    </button>
  );
}
