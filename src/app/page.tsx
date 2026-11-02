'use client';

import React from 'react';
import { PillButton } from '@/components/motion/pill-button';
import { Reveal } from '@/components/motion/reveal';
import { Stagger, StaggerItem } from '@/components/motion/stagger';
import { Marquee } from '@/components/motion/marquee';
import { CountUp } from '@/components/motion/count-up';
import { useLanguage } from '@/lib/language-context';
import { APP_CONFIG } from '@/config/app';
import { Flame, Zap, Activity, Award, ArrowRight } from 'lucide-react';

export default function Home() {
  const { t } = useLanguage();

  const marqueeStats = [
    t('১০০% ফ্রি ও ওপেন ডেটা', '100% Free & Open Data'),
    t('৩০০+ খাঁটি দেশি খাবার', '300+ Authentic Bangladeshi Foods'),
    t('সঠিক BMR ও TDEE ক্যালকুলেটর', 'Precision BMR & TDEE Calculations'),
    t('অফলাইন উপযোগী PWA অ্যাপ', 'Offline Installable PWA'),
    t('পেশাদার জিম স্প্লিট ও ট্র্যাকার', 'Pro Gym Splits & Streak Tracker'),
    t('কোনো বিজ্ঞাপন বা পেওয়াল নেই', 'Zero Paywalls or Gimmicks'),
  ];

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero Atmosphere Glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] lightning-aura pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl flex flex-col items-center text-center">
          {/* Badge */}
          <Reveal delay={0.1}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/80 border border-border text-foreground text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
              <Zap className="w-3.5 h-3.5 text-lime-brand fill-lime-brand" />
              <span>{t('দেশি খাবার ও জিম বিপ্লব', 'Bangladesh Fitness Revolution')}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-pink-brand animate-ping" />
            </div>
          </Reveal>

          {/* Heading with Fluid Clamp Typography */}
          <Reveal delay={0.2}>
            <h1 className="font-display font-extrabold uppercase text-fluid-hero tracking-tight max-w-5xl text-foreground">
              {t('আপনার ফিটনেস লক্ষ্য অর্জনের ', 'ACHIEVE YOUR ')}
              <span className="text-lime-brand drop-shadow-[0_0_25px_rgba(169,242,107,0.35)]">
                {t('সঠিক সঙ্গী', 'FITNESS DREAMS')}
              </span>
            </h1>
          </Reveal>

          {/* Subtitle */}
          <Reveal delay={0.3}>
            <p className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl font-normal leading-relaxed">
              {t(APP_CONFIG.descriptionBn, APP_CONFIG.descriptionEn)}
            </p>
          </Reveal>

          {/* CTAs */}
          <Reveal delay={0.4} className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <PillButton
              href="/calculator"
              variant="primary"
              size="lg"
              icon="arrow"
            >
              {t('ফ্রি শুরু করুন', 'Start Free Trial')}
            </PillButton>
            <PillButton
              href="/foods"
              variant="outline"
              size="lg"
              icon="arrow"
            >
              {t('খাদ্য তালিকা দেখুন', 'Browse Foods')}
            </PillButton>
          </Reveal>

          {/* Hero Metric Counter Badges */}
          <Reveal delay={0.5} className="mt-16 w-full max-w-4xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-3xl bg-card/60 backdrop-blur-md border border-border/60 shadow-lg">
              <div className="flex flex-col items-center p-3">
                <span className="text-3xl md:text-4xl text-lime-brand">
                  <CountUp end={300} suffix="+" />
                </span>
                <span className="text-xs uppercase font-bold text-muted-foreground mt-1">
                  {t('দেশি খাবার পুষ্টি', 'Bangladeshi Foods')}
                </span>
              </div>
              <div className="flex flex-col items-center p-3">
                <span className="text-3xl md:text-4xl text-foreground">
                  <CountUp end={100} suffix="%" />
                </span>
                <span className="text-xs uppercase font-bold text-muted-foreground mt-1">
                  {t('বিনামূল্যে উন্মুক্ত', 'Free & Open')}
                </span>
              </div>
              <div className="flex flex-col items-center p-3">
                <span className="text-3xl md:text-4xl text-pink-brand">
                  <CountUp end={30} suffix="+" />
                </span>
                <span className="text-xs uppercase font-bold text-muted-foreground mt-1">
                  {t('কোর ব্যায়াম গাইড', 'Exercise Guides')}
                </span>
              </div>
              <div className="flex flex-col items-center p-3">
                <span className="text-3xl md:text-4xl text-tomato-brand">
                  <CountUp end={4} suffix=" Splits" />
                </span>
                <span className="text-xs uppercase font-bold text-muted-foreground mt-1">
                  {t('ওয়ার্কআউট প্ল্যান', 'Workout Splits')}
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Marquee Velocity Ribbon Strip */}
      <section className="py-4 bg-lime-brand text-ink-base border-y-2 border-ink-base overflow-hidden shadow-inner">
        <Marquee items={marqueeStats} speed={25} itemClassName="text-ink-base font-extrabold text-lg sm:text-xl" />
      </section>

      {/* Design System Tokens & Feature Showcase (Phase 1 Verification) */}
      <section className="py-20 md:py-28 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-fluid-section text-foreground">
              {t('ডিজাইন সিস্টেম ও ফিচার আর্কিটেকচার', 'Design System & Architecture')}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {t(
                'উচ্চগতির ইউজার ইন্টারফেস, সঠিক বৈপরীত্য (WCAG AA), এবং দেশি অ্যাথলেটদের জন্য তৈরি বিশেষ ডিজাইন।',
                'High-performance responsive UI with WCAG AA compliance and tailored fitness tokens.'
              )}
            </p>
          </div>

          {/* Staggered Cards Grid */}
          <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Light Green & Ink Contrast */}
            <StaggerItem>
              <div className="rounded-3xl p-8 bg-card border border-border shadow-sm flex flex-col justify-between h-full">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-lime-soft flex items-center justify-center text-ink-base mb-6 border border-lime-brand/30">
                    <Activity className="w-6 h-6 text-ink-base" />
                  </div>
                  <h3 className="font-display text-2xl text-foreground">
                    {t('মিল ও ক্যালোরি ব্যালেন্স', 'Meal & Macro Balance')}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {t(
                      'ভাত, ডাল, ইলিশ ও মুরগির সুনির্দিষ্ট পুষ্টিমান, BMR ও MET ব্যায়াম ক্যালোরি হিসাব।',
                      'Accurate nutrition for Bangladeshi rice, lentils, fish & chicken with Mifflin-St Jeor BMR.'
                    )}
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-border flex items-center justify-between text-xs font-bold text-lime-hover">
                  <span>{t('গেস্ট-ফার্স্ট মোড', 'Guest-First Persistent')}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </StaggerItem>

            {/* Card 2: Thunder Pink Accent */}
            <StaggerItem>
              <div className="rounded-3xl p-8 bg-card border border-border shadow-sm flex flex-col justify-between h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-brand/10 rounded-full blur-2xl pointer-events-none" />
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-pink-soft flex items-center justify-center text-pink-brand mb-6 border border-pink-brand/30">
                    <Flame className="w-6 h-6 text-pink-brand" />
                  </div>
                  <h3 className="font-display text-2xl text-foreground">
                    {t('স্ট্রিক ও চ্যালেঞ্জ', 'Streaks & Challenges')}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {t(
                      'Asia/Dhaka টাইমজোনে দৈনিক ওয়ার্কআউট ও খাবার লগের মাধ্যমে ধারাবাহিকতা বজায় রাখুন।',
                      'Track daily discipline in Asia/Dhaka timezone with server-generated shareable OG cards.'
                    )}
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-border flex items-center justify-between text-xs font-bold text-pink-brand">
                  <span>{t('বন্ধুদের সাথে চ্যালেঞ্জ', 'Friend Group Challenges')}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </StaggerItem>

            {/* Card 3: Tomato Energy Accent */}
            <StaggerItem>
              <div className="rounded-3xl p-8 bg-card border border-border shadow-sm flex flex-col justify-between h-full">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-tomato-brand/10 flex items-center justify-center text-tomato-brand mb-6 border border-tomato-brand/30">
                    <Award className="w-6 h-6 text-tomato-brand" />
                  </div>
                  <h3 className="font-display text-2xl text-foreground">
                    {t('ব্যায়াম ও স্প্লিট প্ল্যান', 'Exercise Splits & Form')}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {t(
                      '৩ থেকে ৬ দিনের স্প্লিট প্ল্যান, সহজ বাংলা নির্দেশনা এবং ইউটিউব ক্লিক-টু-লোড ফ্যাসাড।',
                      'Full body, Push-Pull-Legs and Upper-Lower splits with lightweight YouTube facades.'
                    )}
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-border flex items-center justify-between text-xs font-bold text-tomato-brand">
                  <span>{t('ফুল লাইব্রেরি সাপোর্ট', 'Full Library Access')}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </StaggerItem>
          </Stagger>

          {/* Palette Tokens Verification Box */}
          <div className="mt-16 p-8 rounded-3xl bg-secondary/40 border border-border">
            <h4 className="font-display text-lg text-foreground mb-4">
              {t('কালার প্যালেট ও টোকেন ভেরিফিকেশন', 'Theme Tokens Verification')}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs font-bold uppercase">
              <div className="p-4 rounded-2xl bg-silver-100 text-ink-base border border-border">
                Silver 100
                <div className="text-[10px] font-normal opacity-70">#E6E8EB</div>
              </div>
              <div className="p-4 rounded-2xl bg-lime-brand text-ink-base border border-lime-hover shadow-sm">
                Light Green
                <div className="text-[10px] font-normal opacity-70">#A9F26B (Ink text)</div>
              </div>
              <div className="p-4 rounded-2xl bg-pink-brand text-white border border-pink-brand shadow-sm">
                Thunder Pink
                <div className="text-[10px] font-normal opacity-70">#FF2E88</div>
              </div>
              <div className="p-4 rounded-2xl bg-tomato-brand text-white border border-tomato-deep shadow-sm">
                Tomato
                <div className="text-[10px] font-normal opacity-70">#FF6347</div>
              </div>
              <div className="p-4 rounded-2xl bg-ink-base text-white border border-white/20 shadow-sm">
                Ink Base
                <div className="text-[10px] font-normal opacity-70">#0F1412</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
