'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PillButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'pink' | 'tomato' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: 'arrow' | 'external' | 'none';
  href?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

export function PillButton({
  children,
  variant = 'primary',
  size = 'md',
  icon = 'arrow',
  href,
  onClick,
  className,
  disabled = false,
  type = 'button',
  fullWidth = false,
}: PillButtonProps) {
  const sizeClasses = {
    sm: 'min-h-[38px] px-4 py-2 text-xs font-bold gap-2',
    md: 'min-h-[46px] px-6 py-2.5 text-sm font-bold gap-2.5',
    lg: 'min-h-[54px] px-8 py-3.5 text-base font-extrabold gap-3',
  };

  // Rule 1: Text on Light Green MUST always be Ink (#0F1412)
  const variantClasses = {
    primary:
      'bg-lime-brand text-ink-base hover:bg-lime-hover shadow-[0_4px_20px_rgba(169,242,107,0.35)] hover:shadow-[0_6px_28px_rgba(169,242,107,0.5)] border border-lime-brand',
    pink:
      'bg-pink-brand text-white hover:opacity-95 shadow-[0_4px_20px_rgba(255,46,136,0.35)] hover:shadow-[0_6px_28px_rgba(255,46,136,0.5)] border border-pink-brand',
    tomato:
      'bg-tomato-brand text-white hover:bg-tomato-deep shadow-[0_4px_20px_rgba(255,99,71,0.3)] border border-tomato-brand',
    secondary:
      'bg-secondary text-foreground hover:bg-border/60 border border-border/70',
    outline:
      'bg-transparent text-foreground border-2 border-border/80 hover:bg-secondary/70 hover:border-foreground/40',
    ghost:
      'bg-transparent text-foreground hover:bg-secondary/60 border border-transparent',
  };

  const content = (
    <>
      <span className="tracking-wide uppercase font-display">{children}</span>
      {icon === 'arrow' && (
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black/10 dark:bg-white/15 transition-transform duration-300 group-hover:translate-x-1">
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      )}
      {icon === 'external' && (
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black/10 dark:bg-white/15 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      )}
    </>
  );

  const baseStyles = cn(
    'group relative inline-flex items-center justify-center rounded-full select-none cursor-pointer transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-lime-brand active:scale-[0.97]',
    sizeClasses[size],
    variantClasses[variant],
    fullWidth && 'w-full',
    disabled && 'opacity-50 pointer-events-none cursor-not-allowed',
    className
  );

  if (href) {
    return (
      <Link href={href} className={baseStyles}>
        {content}
      </Link>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={baseStyles}
      whileTap={{ scale: 0.97 }}
    >
      {content}
    </motion.button>
  );
}
