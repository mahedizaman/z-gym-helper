'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';
import { PillButton } from '@/components/motion/pill-button';
import { Calculator } from 'lucide-react';

export default function CalculatorPage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-20 text-center">
      <div className="w-16 h-16 rounded-3xl bg-pink-soft text-pink-brand mx-auto mb-6 flex items-center justify-center border border-pink-brand/30 shadow-sm">
        <Calculator className="w-8 h-8" />
      </div>
      <h1 className="font-display font-black text-4xl sm:text-5xl uppercase text-foreground mb-4">
        {t('মিল ও ক্যালোরি ক্যালকুলেটর', 'Meal & Calorie Calculator')}
      </h1>
      <p className="text-muted-foreground max-w-xl mx-auto mb-8">
        {t(
          'Mifflin-St Jeor ও MET ব্যায়াম ক্যালোরি ব্যালেন্স সিস্টেম লোড হচ্ছে...',
          'Loading full scientific calorie deficit and macro tracking calculations...'
        )}
      </p>
      <PillButton href="/" variant="primary" size="md" icon="arrow">
        {t('হোমে ফিরে যান', 'Back to Home')}
      </PillButton>
    </div>
  );
}
