'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';
import { PillButton } from '@/components/motion/pill-button';
import { Scale } from 'lucide-react';

export default function BMIPage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-20 text-center">
      <div className="w-16 h-16 rounded-3xl bg-lime-soft text-ink-base mx-auto mb-6 flex items-center justify-center border border-lime-brand/30 shadow-sm">
        <Scale className="w-8 h-8" />
      </div>
      <h1 className="font-display font-black text-4xl sm:text-5xl uppercase text-foreground mb-4">
        {t('বডি ম্যাস ইনডেক্স (BMI) ক্যালকুলেটর', 'Body Mass Index (BMI) Calculator')}
      </h1>
      <p className="text-muted-foreground max-w-xl mx-auto mb-8">
        {t(
          'আপনার উচ্চতা ও ওজনের ভিত্তিতে স্বাস্থ্যকর রেঞ্জ ও ক্যাটাগরি বিশ্লেষণ।',
          'Calculate your BMI category and healthy weight targets instantly.'
        )}
      </p>
      <PillButton href="/" variant="primary" size="md" icon="arrow">
        {t('হোমে ফিরে যান', 'Back to Home')}
      </PillButton>
    </div>
  );
}
