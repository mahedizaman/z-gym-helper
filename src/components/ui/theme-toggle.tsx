'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMounted } from '@/lib/use-mounted';

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useIsMounted();

  if (!mounted) {
    return (
      <div
        className={cn(
          'w-10 h-10 rounded-full border border-border/40 bg-secondary/50 animate-pulse',
          className
        )}
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-secondary/60 hover:bg-secondary border border-border/50 text-foreground transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-brand cursor-pointer',
        className
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      type="button"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-lime-brand transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-5 h-5 text-ink-base transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}
