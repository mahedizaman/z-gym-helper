'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register plugins strictly once on client
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  
  // Configure default easing and performance optimizations
  gsap.defaults({
    ease: 'power3.out',
    duration: 0.8,
  });

  // Safe refresh utility
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });
}

export { gsap, ScrollTrigger, useGSAP };

/**
 * Helper to check whether user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
