'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, User } from 'lucide-react';
import { Wordmark } from '@/components/ui/wordmark';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { PillButton } from '@/components/motion/pill-button';
import { APP_CONFIG } from '@/config/app';
import { useLanguage } from '@/lib/language-context';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const { t, locale } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Synchronously reset mobile menu during rendering on pathname change
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'py-2.5 glass-panel border-b border-border/40 shadow-sm'
          : 'py-4 bg-background/60 backdrop-blur-md'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl flex items-center justify-between gap-4">
        {/* Brand Wordmark with lightning bolt Z */}
        <Wordmark size="md" />

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Main Navigation"
          className="hidden lg:flex items-center gap-1 xl:gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/40"
        >
          {APP_CONFIG.navLinks.map((link) => {
            const isActive = pathname === link.href;
            const label = locale === 'bn' ? link.labelBn : link.labelEn;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors duration-200',
                  isActive
                    ? 'text-ink-base dark:text-ink-base'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-active-pill"
                    className="absolute inset-0 rounded-full bg-lime-brand shadow-sm -z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <LanguageToggle />
          <ThemeToggle />
          <PillButton
            href="/calculator"
            variant="primary"
            size="sm"
            icon="arrow"
            className="hidden sm:inline-flex"
          >
            {t('শুরু করুন', 'Start Free')}
          </PillButton>
          <Link
            href="/login"
            className="flex items-center justify-center w-10 h-10 rounded-full border border-border/60 hover:bg-secondary text-foreground transition-all duration-200"
            aria-label="Account Login"
          >
            <User className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
          <LanguageToggle className="px-2.5 sm:px-3 text-[11px] sm:text-xs" />
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-border/60 bg-secondary/70 text-foreground transition-transform active:scale-95 cursor-pointer shrink-0"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            type="button"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-tomato-brand" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Accessible Sheet) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 top-[65px] bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Slide-out Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed inset-x-0 top-[65px] max-h-[calc(100dvh-65px)] overflow-y-auto bg-card/95 backdrop-blur-xl border-b border-border/60 p-6 z-50 lg:hidden flex flex-col gap-6 shadow-2xl rounded-b-3xl"
            >
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground px-3">
                  {t('মেনু', 'Navigation')}
                </span>
                {APP_CONFIG.navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  const label = locale === 'bn' ? link.labelBn : link.labelEn;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center justify-between px-4 py-3.5 rounded-2xl text-base font-bold font-display uppercase tracking-wide transition-all',
                        isActive
                          ? 'bg-lime-brand text-ink-base shadow-md font-black'
                          : 'text-foreground hover:bg-secondary/70'
                      )}
                    >
                      <span>{label}</span>
                      <ArrowRight className="w-4 h-4 opacity-70" />
                    </Link>
                  );
                })}
              </div>

              <div className="h-px bg-border/40 w-full" />

              {/* Action Buttons in Mobile Drawer */}
              <div className="flex flex-col gap-3">
                <PillButton
                  href="/calculator"
                  variant="primary"
                  size="md"
                  fullWidth
                  icon="arrow"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('ফ্রি ক্যালকুলেটর শুরু করুন', 'Start Free Calculator')}
                </PillButton>
                <PillButton
                  href="/login"
                  variant="outline"
                  size="md"
                  fullWidth
                  icon="none"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('লগইন / রেজিস্টার', 'Login / Register')}
                </PillButton>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
