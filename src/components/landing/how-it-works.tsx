'use client';

import React, { useRef } from 'react';
import { useLanguage } from '@/lib/language-context';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { Search, Flame, Dumbbell, ArrowRight } from 'lucide-react';

export function HowItWorks() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const steps = [
    {
      num: '01',
      icon: Search,
      titleBn: 'খাবারের পুষ্টি খুঁজুন',
      titleEn: 'Search Bangladeshi Foods',
      descBn: 'ভাত, ডাল, মাছ, মাংস ও ভর্তার আনুমানিক ক্যালোরি ও প্রোটিন মান মুহূর্তেই জেনে নিন।',
      descEn: 'Search 300+ local staples and get estimated macros for bowls, pieces, or grams.',
      badge: 'Step 1',
    },
    {
      num: '02',
      icon: Flame,
      titleBn: 'সহজ দৈনিক লক্ষ্য ঠিক করুন',
      titleEn: 'Set Your Daily Targets',
      descBn: 'আপনার বয়স, ওজন ও লক্ষ্য অনুযায়ী দৈনিক ক্যালোরি ও প্রোটিনের নিরাপদ লক্ষ্য জেনে নিন।',
      descEn: 'Calculate safe personalized daily calorie and protein targets with zero jargon.',
      badge: 'Step 2',
    },
    {
      num: '03',
      icon: Dumbbell,
      titleBn: 'ওয়ার্কআউট ও স্ট্রিক ধরে রাখুন',
      titleEn: 'Follow Splits & Build Streaks',
      descBn: '৩ থেকে ৬ দিনের জিম স্প্লিট মেনে চলুন এবং এশিয়া/ঢাকা সময়ে প্রতিদিনের ধারাবাহিকতা ধরে রাখুন।',
      descEn: 'Pick a structured 3-6 day split, log exercises, and build an unbroken daily streak.',
      badge: 'Step 3',
    },
  ];

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) return;

      const mm = gsap.matchMedia();

      // Desktop & Tablet: Pinned Horizontal Scroll
      mm.add('(min-width: 768px)', () => {
        const track = trackRef.current;
        const trigger = triggerRef.current;
        const path = pathRef.current;

        if (!track || !trigger) return;

        const totalScroll = track.scrollWidth - window.innerWidth + 120;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: trigger,
            pin: true,
            scrub: 1,
            start: 'top top',
            end: () => `+=${totalScroll}`,
            invalidateOnRefresh: true,
          },
        });

        tl.to(track, {
          x: () => -totalScroll,
          ease: 'none',
        });

        // Animate SVG path draw if path exists
        if (path) {
          const pathLength = path.getTotalLength();
          gsap.set(path, {
            strokeDasharray: pathLength,
            strokeDashoffset: pathLength,
          });

          tl.to(
            path,
            {
              strokeDashoffset: 0,
              ease: 'none',
            },
            0
          );
        }
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative w-full py-16 md:py-24 bg-secondary/30 border-y border-border overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-lime-soft border border-lime-brand/30 text-ink-base text-xs font-bold uppercase tracking-wider mb-3">
            {t('ধাপে ধাপে সহজ গাইড', 'Step-by-Step Flow')}
          </div>
          <h2 className="font-display font-black text-fluid-section uppercase tracking-tight text-foreground">
            {t('কীভাবে কাজ করে জেড-জিম?', 'HOW IT WORKS FOR YOU')}
          </h2>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground max-w-md">
          {t(
            'মাত্র ৪টি সাধারণ পদক্ষেপে আপনার স্বাস্থ্যকর জীবনের যাত্রা শুরু করুন। কোনো সাবস্ক্রিপশন ফি বা ঝামেলা ছাড়া।',
            'Start your transformation in 4 simple steps without paywalls or unnecessary friction.'
          )}
        </p>
      </div>

      {/* Main Track Container */}
      <div ref={triggerRef} className="relative w-full overflow-hidden">
        {/* Animated Dashed SVG Connecting Line (Desktop) */}
        <div className="hidden md:block absolute top-1/2 left-0 w-full -translate-y-1/2 pointer-events-none -z-10 opacity-30">
          <svg className="w-[2000px] h-24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              ref={pathRef}
              d="M 50,48 Q 400,-10 750,48 T 1450,48 T 2150,48"
              stroke="#A9F26B"
              strokeWidth="4"
              strokeDasharray="12 12"
            />
          </svg>
        </div>

        {/* Steps Cards: Horizontal on Desktop, Vertical Stack on Mobile */}
        <div
          ref={trackRef}
          className="flex flex-col md:flex-row gap-6 md:gap-8 px-4 sm:px-8 md:px-12 w-full md:w-max items-stretch"
        >
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={`step-${idx}`}
                className="relative flex flex-col justify-between w-full md:w-[380px] lg:w-[420px] p-8 rounded-3xl bg-card border border-border shadow-md hover:border-lime-brand/80 transition-all shrink-0"
              >
                <div>
                  {/* Step Number & Badge */}
                  <div className="flex items-center justify-between mb-8">
                    <span className="font-display text-4xl sm:text-5xl font-black text-lime-brand tracking-tighter">
                      {step.num}
                    </span>
                    <span className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-secondary border border-border text-foreground">
                      {step.badge}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-foreground mb-6 border border-border">
                    <Icon className="w-7 h-7 text-lime-brand" />
                  </div>

                  {/* Title & Desc */}
                  <h3 className="font-display font-extrabold text-2xl uppercase text-foreground mb-3">
                    {t(step.titleBn, step.titleEn)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(step.descBn, step.descEn)}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-border flex items-center justify-between text-xs font-bold text-muted-foreground">
                  <span>{t('সহজ ও দ্রুত', 'Zero Setup Required')}</span>
                  <ArrowRight className="w-4 h-4 text-lime-brand" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
