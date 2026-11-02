'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';
import { PillButton } from '@/components/motion/pill-button';
import { Dumbbell } from 'lucide-react';

export default function PlansPage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-20 text-center">
      <div className="w-16 h-16 rounded-3xl bg-lime-soft text-ink-base mx-auto mb-6 flex items-center justify-center border border-lime-brand/30 shadow-sm">
        <Dumbbell className="w-8 h-8" />
      </div>
      <h1 className="font-display font-black text-4xl sm:text-5xl uppercase text-foreground mb-4">
        {t('ওয়ার্কআউট প্ল্যান ও স্প্লিট রুটিন', 'Workout Plans & Splits')}
      </h1>
      <p className="text-muted-foreground max-w-xl mx-auto mb-8">
        {t(
          '৩, ৪, ৫ এবং ৬ দিনের ফুল বডি, আপার-লোয়ার ও পুশ-পুল-লেগস স্প্লিট লাইব্রেরি।',
          'Explore structured 3, 4, 5, and 6 day gym training splits with exercise sets and reps.'
        )}
      </p>
      <PillButton href="/" variant="primary" size="md" icon="arrow">
        {t('হোমে ফিরে যান', 'Back to Home')}
      </PillButton>
    </div>
  );
}
