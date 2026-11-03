'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

interface AdSlotProps {
  slotId?: string;
  slot?: 'horizontal' | 'rectangle' | 'banner' | string;
  format?: 'horizontal' | 'rectangle' | 'banner';
  className?: string;
}

/**
 * Reusable Google AdSense ad slot component.
 * Features:
 * 1. Strict Exclusion: Never renders on /login, /settings, or /admin.
 * 2. Static Reserved Height: Zero Cumulative Layout Shift (CLS).
 * 3. Feature Flag: Controlled strictly via NEXT_PUBLIC_ADS_ENABLED=false.
 */
export function AdSlot({
  slotId,
  format = 'horizontal',
  className = '',
}: AdSlotProps) {
  const pathname = usePathname();

  // Strict Exclusion Rules: No ads on login, settings, or administration
  if (
    pathname === '/login' ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/admin')
  ) {
    return null;
  }

  // Feature Flag: Disabled by default
  const isAdsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === 'true';

  if (!isAdsEnabled) {
    return null;
  }

  // Reserved height classes based on standard IAB ad dimensions
  const heightClass =
    format === 'rectangle'
      ? 'min-h-[250px] w-full max-w-[300px] sm:max-w-[336px]'
      : format === 'banner'
        ? 'min-h-[100px] w-full max-w-[320px] sm:max-w-[468px]'
        : 'min-h-[90px] w-full max-w-[728px]';

  return (
    <div
      aria-hidden="true"
      className={`mx-auto my-6 flex items-center justify-center overflow-hidden rounded-2xl bg-secondary/20 border border-border/30 text-center ${heightClass} ${className}`}
    >
      <ins
        className="adsbygoogle block w-full h-full"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT || ''}
        data-ad-slot={slotId || ''}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
