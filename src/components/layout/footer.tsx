'use client';

import React from 'react';
import Link from 'next/link';
import { Wordmark } from '@/components/ui/wordmark';
import { APP_CONFIG } from '@/config/app';
import { useLanguage } from '@/lib/language-context';
import { Heart, Sparkles, ShieldCheck } from 'lucide-react';

export function Footer() {
  const { t, locale } = useLanguage();
  const currentYear = 2026;

  return (
    <footer className="w-full mt-24 px-4 sm:px-6 lg:px-8 pb-8">
      {/* Dark Rounded Container */}
      <div className="container mx-auto max-w-7xl rounded-3xl bg-ink-base text-silver-50 border border-white/10 p-8 sm:p-12 lg:p-16 overflow-hidden relative shadow-2xl">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-brand/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-brand/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Wordmark size="lg" className="text-white" />
            <p className="text-silver-300 text-sm leading-relaxed max-w-sm">
              {t(APP_CONFIG.descriptionBn, APP_CONFIG.descriptionEn)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-brand/15 border border-lime-brand/30 text-lime-brand text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                {t('উন্মুক্ত ওপেন ডেটা', 'Open Data Platform')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-silver-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                {t('পেওয়াল-মুক্ত এক্সেস', 'No Paywalls')}
              </span>
            </div>
          </div>

          {/* Quick Tools */}
          <div className="flex flex-col gap-3">
            <h3 className="font-display text-base tracking-wider text-white uppercase font-bold">
              {t('ফিচার ও টুলস', 'Features & Tools')}
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-silver-300">
              {APP_CONFIG.navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-lime-brand transition-colors duration-200"
                  >
                    {locale === 'bn' ? link.labelBn : link.labelEn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* User App Links */}
          <div className="flex flex-col gap-3">
            <h3 className="font-display text-base tracking-wider text-white uppercase font-bold">
              {t('অ্যাপ মেনু', 'User Area')}
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-silver-300">
              {APP_CONFIG.appLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-lime-brand transition-colors duration-200"
                  >
                    {locale === 'bn' ? link.labelBn : link.labelEn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="flex flex-col gap-3">
            <h3 className="font-display text-base tracking-wider text-white uppercase font-bold">
              {t('নীতিমালা ও তথ্য', 'Legal & About')}
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-silver-300">
              {APP_CONFIG.footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-lime-brand transition-colors duration-200"
                  >
                    {locale === 'bn' ? link.labelBn : link.labelEn}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/about#attributions"
                  className="hover:text-lime-brand transition-colors duration-200"
                >
                  {t('মিডিয়া অ্যাট্রিবিউশন', 'Media Attributions')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="relative z-10 mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-silver-500">
          <p>
            &copy; {currentYear} {APP_CONFIG.name}. {t('সর্বস্বত্ব সংরক্ষিত।', 'All rights reserved.')}
          </p>
          <div className="flex items-center gap-1.5 text-silver-300">
            <span>{t('বাংলাদেশে তৈরি', 'Crafted with')}</span>
            <Heart className="w-3.5 h-3.5 text-pink-brand fill-pink-brand" />
            <span>{t('বাংলাদেশী ফিটনেস কমিউনিটির জন্য', 'for Bangladesh Fitness Community')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
