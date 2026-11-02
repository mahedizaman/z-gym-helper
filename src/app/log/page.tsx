'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';
import { PillButton } from '@/components/motion/pill-button';
import { PlusCircle } from 'lucide-react';

export default function LogPage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-20 text-center">
      <div className="w-16 h-16 rounded-3xl bg-lime-soft text-ink-base mx-auto mb-6 flex items-center justify-center border border-lime-brand/30 shadow-sm">
        <PlusCircle className="w-8 h-8" />
      </div>
      <h1 className="font-display font-black text-4xl sm:text-5xl uppercase text-foreground mb-4">
        {t('খাবার ও ব্যায়াম লগ', 'Log Meals & Workouts')}
      </h1>
      <p className="text-muted-foreground max-w-xl mx-auto mb-8">
        {t(
          'সকালের নাস্তা, দুপুরের খাবার, স্ন্যাক্স, রাতের খাবার ও জিম সেশন লগ করুন।',
          'Track your daily meals (Breakfast, Lunch, Snacks, Dinner) and gym sets.'
        )}
      </p>
      <PillButton href="/" variant="primary" size="md" icon="arrow">
        {t('হোমে ফিরে যান', 'Back to Home')}
      </PillButton>
    </div>
  );
}
