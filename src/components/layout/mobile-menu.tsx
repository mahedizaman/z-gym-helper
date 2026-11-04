'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { gsap } from '@/lib/gsap';
import {
  X,
  ArrowRight,
  Shield,
  LayoutDashboard,
  LogOut,
  Zap,
} from 'lucide-react';
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogClose,
  DialogTitle,
} from '@radix-ui/react-dialog';
import { Wordmark } from '@/components/ui/wordmark';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { PillButton } from '@/components/motion/pill-button';
import { APP_CONFIG } from '@/config/app';
import { useLanguage } from '@/lib/language-context';
import { cn } from '@/lib/utils';
import { Z_INDEX } from '@/config/z-index';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const { t, locale } = useLanguage();
  const isBn = locale === 'bn';
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const curtainRef = useRef<HTMLDivElement>(null);
  const closeIconRef = useRef<HTMLButtonElement>(null);
  const isClosingRef = useRef(false);

  // Auto-close on route change
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    if (isOpen) {
      onClose();
    }
  }

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Close handler with reverse GSAP curtain animation
  const handleClose = () => {
    if (isClosingRef.current) return;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !curtainRef.current) {
      onClose();
      return;
    }

    isClosingRef.current = true;
    gsap.to(curtainRef.current, {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
      opacity: 0,
      duration: 0.28,
      ease: 'power3.in',
      onComplete: () => {
        isClosingRef.current = false;
        onClose();
      },
    });
  };

  // GSAP Curtain Reveal Timeline
  useEffect(() => {
    if (!isOpen || !curtainRef.current) return;
    isClosingRef.current = false;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      gsap.set(curtainRef.current, { opacity: 1, clipPath: 'none' });
      return;
    }

    const ctx = gsap.context(() => {
      // Dramatic wipe-down clip-path curtain reveal
      gsap.fromTo(
        curtainRef.current,
        {
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
          opacity: 1,
        },
        {
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          duration: 0.42,
          ease: 'power4.out',
        }
      );

      // Rotate close icon into view
      if (closeIconRef.current) {
        gsap.fromTo(
          closeIconRef.current,
          { rotate: -180, scale: 0.7, opacity: 0 },
          { rotate: 0, scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(1.7)', delay: 0.1 }
        );
      }
    }, curtainRef);

    return () => ctx.revert();
  }, [isOpen]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.03,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        damping: 24,
        stiffness: 280,
      },
    },
    exit: { opacity: 0, y: 12 },
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogPortal>
        {/* Completely solid backdrop preventing content bleeding */}
        <DialogOverlay
          style={{ zIndex: Z_INDEX.overlay }}
          className="fixed inset-0 bg-black/90 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />

        {/* Full-viewport solid curtain sheet using CSS variable tokens */}
        <DialogContent
          ref={curtainRef}
          style={{ zIndex: Z_INDEX.sheet }}
          className="fixed inset-0 w-full h-[100dvh] bg-background text-foreground flex flex-col justify-between overflow-y-auto overflow-x-hidden outline-none select-none border-none"
        >
          {/* Accessible Dialog Title for screen readers */}
          <DialogTitle className="sr-only">
            {isBn ? 'মোবাইল নেভিগেশন মেনু' : 'Mobile Navigation Menu'}
          </DialogTitle>

          {/* Top Bar: Wordmark & Close Button with solid opaque background */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border/80 bg-background shrink-0">
            <Wordmark size="md" forceShowHelper />

            <div className="flex items-center gap-2">
              <DialogClose asChild>
                <button
                  ref={closeIconRef}
                  onClick={handleClose}
                  type="button"
                  aria-label="Close Navigation Menu"
                  className="w-11 h-11 rounded-full flex items-center justify-center bg-secondary hover:bg-muted text-foreground border border-border transition-transform active:scale-95 cursor-pointer shadow-sm"
                >
                  <X className="w-5 h-5 text-tomato-brand" />
                </button>
              </DialogClose>
            </div>
          </div>

          {/* Main Navigation Links with Framer Motion Stagger */}
          <div className="flex-1 px-6 py-6 sm:py-8 flex flex-col justify-center max-w-xl mx-auto w-full">
            <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-4 px-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-lime-brand fill-lime-brand" />
              <span>{t('মেনু ব্রাউজ করুন', 'Explore Z-Gym')}</span>
            </span>

            <motion.nav
              aria-label="Mobile Navigation"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex flex-col gap-2 sm:gap-2.5"
            >
              {APP_CONFIG.navLinks.map((link) => {
                const isActive = pathname === link.href;
                const label = isBn ? link.labelBn : link.labelEn;

                return (
                  <motion.div key={link.href} variants={itemVariants}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className={cn(
                        'group relative flex items-center justify-between px-5 py-3.5 sm:py-4 rounded-3xl transition-all duration-200 border text-left',
                        isActive
                          ? 'bg-lime-brand text-ink-base border-lime-brand shadow-lg font-black'
                          : 'bg-card text-card-foreground hover:bg-secondary border border-border/80 hover:border-lime-brand/50 shadow-xs'
                      )}
                    >
                      {/* Thunder-pink energetic accent line for active route */}
                      {isActive && (
                        <span className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full bg-pink-brand shadow-[0_0_8px_rgba(255,46,136,0.9)]" />
                      )}

                      <span className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight pl-1">
                        {label}
                      </span>

                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1',
                          isActive
                            ? 'bg-ink-base text-lime-brand'
                            : 'bg-secondary text-muted-foreground group-hover:text-foreground'
                        )}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.nav>

            {/* Authenticated Quick Shortcuts or CTA */}
            <div className="mt-6 pt-5 border-t border-border/80 flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  {session?.user?.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={onClose}
                      className="flex items-center justify-between px-5 py-3.5 rounded-2xl bg-secondary border border-lime-brand/40 text-lime-brand font-bold text-sm shadow-xs"
                    >
                      <span className="flex items-center gap-2.5">
                        <Shield className="w-4 h-4" />
                        <span>{t('অ্যাডমিন কনসোল', 'Admin Console')}</span>
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    onClick={onClose}
                    className="flex items-center justify-between px-5 py-3.5 rounded-2xl bg-lime-brand text-ink-base font-black font-display uppercase tracking-wide text-sm shadow-md"
                  >
                    <span className="flex items-center gap-2.5">
                      <LayoutDashboard className="w-4 h-4" />
                      <span>{t('ড্যাশবোর্ডে যান', 'Open Dashboard')}</span>
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      signOut({ callbackUrl: '/' });
                    }}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-border bg-card text-foreground font-bold text-xs uppercase tracking-wider hover:bg-secondary cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-tomato-base" />
                    <span>{t('লগআউট করুন', 'Sign Out')}</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <PillButton
                    href="/calculator"
                    variant="primary"
                    size="md"
                    fullWidth
                    icon="arrow"
                    onClick={onClose}
                  >
                    {t('ক্যালকুলেটর শুরু করুন', 'Start Calculator')}
                  </PillButton>
                  <PillButton
                    href="/login"
                    variant="outline"
                    size="md"
                    fullWidth
                    icon="none"
                    onClick={onClose}
                  >
                    {t('লগইন / রেজিস্টার', 'Login / Register')}
                  </PillButton>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Bar: Language & Theme Controls with solid opaque background */}
          <div className="px-6 py-4 border-t border-border/80 bg-background shrink-0 flex items-center justify-between max-w-xl mx-auto w-full">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t('ভাষা:', 'Lang:')}
              </span>
              <LanguageToggle className="px-3 py-1.5 text-xs font-bold" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t('থিম:', 'Theme:')}
              </span>
              <ThemeToggle />
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
