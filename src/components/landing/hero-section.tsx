'use client';

import React, { useRef, useState } from 'react';
import { PillButton } from '@/components/motion/pill-button';
import { AthleteGraphic } from './athlete-graphic';
import { VideoModal } from './video-modal';
import { useLanguage } from '@/lib/language-context';
import { Play, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';

export function HeroSection() {
  const { t } = useLanguage();
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const athleteRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Check for prefers-reduced-motion
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) return;

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from(badgeRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.6,
      })
        .from(
          '.hero-headline-line',
          {
            y: 40,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
          },
          '-=0.3'
        )
        .from(
          ctaRef.current,
          {
            y: 20,
            opacity: 0,
            duration: 0.6,
          },
          '-=0.4'
        )
        .from(
          athleteRef.current,
          {
            scale: 0.94,
            opacity: 0,
            duration: 1,
            ease: 'expo.out',
          },
          '-=0.7'
        );
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative pt-8 pb-16 md:pt-14 md:pb-24 px-4 sm:px-6 overflow-hidden"
    >
      {/* Background Lightning Aura Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[500px] lightning-aura pointer-events-none -z-10" />

      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Top Tagline Badge */}
            <div
              ref={badgeRef}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/80 border border-border text-foreground text-xs font-bold uppercase tracking-wider mb-6 shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-lime-brand fill-lime-brand" />
              <span>{t('বাংলাদেশের জিম ও পুষ্টি গাইড', "Bangladesh's Premier Fitness Hub")}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-pink-brand animate-ping" />
            </div>

            {/* Display Headline */}
            <h1
              ref={headlineRef}
              className="font-display font-black uppercase text-fluid-hero tracking-tight text-foreground max-w-2xl"
            >
              <span className="block hero-headline-line">
                {t('আপনার ফিটনেস', 'ACHIEVE YOUR')}
              </span>
              <span className="block hero-headline-line text-lime-brand drop-shadow-[0_0_24px_rgba(169,242,107,0.4)]">
                {t('স্বপ্ন পূরণ করুন', 'FITNESS DREAMS')}
              </span>
            </h1>

            {/* Subtext description */}
            <p className="mt-6 text-base sm:text-lg text-muted-foreground font-normal max-w-xl leading-relaxed">
              {t(
                '৩০০+ খাঁটি দেশি খাবারের পুষ্টিমান, BMR ও ক্যালোরি ক্যালকুলেটর, জিম ওয়ার্কআউট স্প্লিট ও ডেইলি স্ট্রিক — সম্পূর্ণ বিনামূল্যে। কোনো সাবস্ক্রিপশন বা পেওয়াল নেই।',
                '300+ Bangladeshi food nutrition profiles, exact Mifflin-St Jeor BMR calculator, proven workout splits, and daily streak tracking — 100% free with zero paywalls.'
              )}
            </p>

            {/* Action Buttons */}
            <div
              ref={ctaRef}
              className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4 w-full sm:w-auto"
            >
              <PillButton
                href="/calculator"
                variant="primary"
                size="lg"
                icon="arrow"
              >
                {t('ফ্রি শুরু করুন', 'Start Free')}
              </PillButton>

              {/* Watch Video Button with click facade */}
              <button
                onClick={() => setVideoModalOpen(true)}
                type="button"
                className="group inline-flex items-center gap-3 px-6 py-3.5 rounded-full border-2 border-border/80 bg-secondary/50 hover:bg-secondary text-foreground text-sm font-extrabold uppercase font-display tracking-wider transition-all duration-200 active:scale-95 cursor-pointer"
                aria-label="Watch video demonstration"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-lime-brand text-ink-base shadow-sm group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-ink-base ml-0.5" />
                </span>
                <span>{t('ভিডিও ডেমো', 'Watch Video')}</span>
              </button>
            </div>

            {/* Trust and Feature Bullets */}
            <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-lime-brand" />
                {t('গেস্ট মোডে লগইন ছাড়াই ব্যবহারযোগ্য', '100% Guest-first without login')}
              </span>
              <span className="hidden sm:inline text-muted-foreground/40">•</span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-pink-brand" />
                {t('অফলাইন উপযোগী PWA অ্যাপ', 'Offline Installable PWA')}
              </span>
            </div>
          </div>

          {/* Right Column: Centered Athlete Graphic with Rim Glow */}
          <div ref={athleteRef} className="lg:col-span-5 w-full flex justify-center">
            <AthleteGraphic />
          </div>
        </div>
      </div>

      {/* Video Modal Facade */}
      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        title={t('জেড-জিম হেল্পার অ্যাপ পরিচিতি', 'Z-Gym Helper Platform Tour')}
        videoId="dQw4w9WgXcQ"
      />
    </section>
  );
}
