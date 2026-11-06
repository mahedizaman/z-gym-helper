'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';
import { PillButton } from '@/components/motion/pill-button';
import { Zap, Sparkles } from 'lucide-react';

export function FinalCTA() {
  const { t } = useLanguage();

  return (
    <section className="relative py-20 md:py-28 px-4 sm:px-6 overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        <div className="relative rounded-3xl bg-ink-base text-white p-10 sm:p-14 lg:p-20 overflow-hidden border-2 border-lime-brand/40 shadow-2xl text-center flex flex-col items-center">
          {/* Background Aura Gradients */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-r from-lime-brand/20 via-pink-brand/15 to-transparent blur-3xl pointer-events-none" />

          {/* Small Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-lime-brand text-xs font-black uppercase tracking-wider mb-8">
            <Zap className="w-3.5 h-3.5 fill-lime-brand" />
            <span>{t('উন্মুক্ত ও স্বাধীন প্ল্যাটফর্ম', 'Open Fitness Platform')}</span>
          </div>

          {/* Main Call to Action Headline */}
          <h2 className="font-display font-black text-fluid-section uppercase tracking-tight text-white max-w-4xl leading-none">
            {t('আজই আপনার ফিটনেস যাত্রার ', 'START YOUR FITNESS REVOLUTION ')}
            <span className="text-lime-brand drop-shadow-[0_0_30px_rgba(169,242,107,0.5)]">
              {t('নতুন অধ্যায় শুরু করুন', 'TODAY WITH Z-GYM')}
            </span>
          </h2>

          <p className="mt-6 text-base sm:text-lg text-silver-300 max-w-2xl leading-relaxed">
            {t(
              'কোনো ক্রেডিট কার্ড বা সাইন-আপ ছাড়াই এখনই ব্যবহার শুরু করুন। দেশি খাবারের পুষ্টিমান ও বৈজ্ঞানিক জিম প্ল্যান আপনার হাতের মুঠোয়।',
              'No credit card or registration required. Access Bangladeshi food nutrition estimates and gym workout splits freely.'
            )}
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <PillButton
              href="/today"
              variant="primary"
              size="lg"
              icon="arrow"
            >
              {t('বিনামূল্যে শুরু করুন', 'Start Free')}
            </PillButton>
            <PillButton
              href="/foods"
              variant="outline"
              size="lg"
              icon="arrow"
              className="border-white/30 text-white hover:bg-white/10"
            >
              {t('খাদ্য তালিকা অনুসন্ধান', 'Browse Bangladeshi Foods')}
            </PillButton>
          </div>

          {/* Footer Subtext */}
          <div className="mt-10 flex items-center gap-2 text-xs text-silver-500 font-semibold">
            <Sparkles className="w-4 h-4 text-lime-brand" />
            <span>
              {t(
                'বাংলাদেশী অ্যাথলেটদের জন্য বিশেষায়িত পুষ্টি প্ল্যাটফর্ম',
                'Built for athletes and gym enthusiasts across Bangladesh'
              )}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
