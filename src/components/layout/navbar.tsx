'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Menu, User, LogOut, Shield } from 'lucide-react';
import { Wordmark } from '@/components/ui/wordmark';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { AnnouncementBell } from '@/components/layout/announcement-bell';
import { MobileMenu } from '@/components/layout/mobile-menu';
import { PillButton } from '@/components/motion/pill-button';
import { APP_CONFIG } from '@/config/app';
import { useLanguage } from '@/lib/language-context';
import { cn } from '@/lib/utils';
import { Z_INDEX } from '@/config/z-index';

export function Navbar() {
  const pathname = usePathname();
  const { t, locale } = useLanguage();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
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

  return (
    <>
      <header
        style={{ zIndex: Z_INDEX.header }}
        className={cn(
          'sticky top-0 w-full transition-all duration-300',
          scrolled
            ? 'py-2.5 glass-panel border-b border-border/40 shadow-sm'
            : 'py-4 bg-background/80 backdrop-blur-md'
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl flex items-center justify-between gap-4">
          {/* Brand Wordmark with readable Z-GYM typography */}
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

            {/* Discreet Admin link for server-verified admins */}
            {session?.user?.role === 'admin' && (
              <Link
                href="/admin"
                className={cn(
                  'relative px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors duration-200 border border-lime-brand/40 text-lime-brand hover:bg-lime-brand/10',
                  pathname.startsWith('/admin')
                    ? 'bg-lime-brand text-ink-base dark:text-ink-base'
                    : ''
                )}
              >
                {locale === 'bn' ? 'অ্যাডমিন' : 'Admin'}
              </Link>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <AnnouncementBell />
            <LanguageToggle />
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-border/50">
                {session?.user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="p-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors shadow-sm"
                    title={t('অ্যাডমিন কনসোল', 'Admin Console')}
                    aria-label="Admin Console"
                  >
                    <Shield className="w-4 h-4 text-lime-brand" />
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors text-xs font-semibold"
                >
                  {session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-lime-brand text-ink-base flex items-center justify-center text-[10px] font-black">
                      {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'Z'}
                    </div>
                  )}
                  <span className="max-w-[100px] truncate">
                    {session?.user?.name?.split(' ')[0] || t('অ্যাথলিট', 'Athlete')}
                  </span>
                </Link>

                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-tomato-base transition-colors cursor-pointer"
                  title={t('লগআউট', 'Sign Out')}
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <PillButton href="/calculator" variant="primary" size="sm" icon="arrow">
                  {t('শুরু করুন', 'Get Started')}
                </PillButton>
                <Link
                  href="/login"
                  className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  title={t('লগইন', 'Login')}
                  aria-label="Account Login"
                >
                  <User className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Actions: Bell, Language, Theme, Hamburger */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
            <AnnouncementBell />
            <LanguageToggle className="px-2.5 sm:px-3 text-[11px] sm:text-xs" />
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-border/80 bg-background hover:bg-secondary text-foreground transition-transform active:scale-95 cursor-pointer shrink-0 shadow-sm"
              aria-label="Open Navigation Menu"
              aria-expanded={mobileMenuOpen}
              type="button"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Rendered through Radix Dialog Portal to document.body, escaping all header stacking contexts */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}
