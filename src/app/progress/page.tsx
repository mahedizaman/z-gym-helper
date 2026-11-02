'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';
import { PillButton } from '@/components/motion/pill-button';
import { TrendingUp } from 'lucide-react';

export default function ProgressPage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-20 text-center">
      <div className="w-16 h-16 rounded-3xl bg-pink-soft text-pink-brand mx-auto mb-6 flex items-center justify-center border border-pink-brand/30 shadow-sm">
        <TrendingUp className="w-8 h-8" />
      </div>
      <h1 className="font-display font-black text-4xl sm:text-5xl uppercase text-foreground mb-4">
        {t('ওজন ও অগ্রগতি ট্র্যাকিং', 'Weight & Progress History')}
      </h1>
      <p className="text-muted-foreground max-w-xl mx-auto mb-8">
        {t(
          'আপনার ওজন পরিবর্তনের চার্ট এবং শেয়ারযোগ্য সামাজিক প্রগ্রেস কার্ড।',
          'Visualize monthly weight delta trends and export your 1080x1350 milestone card.'
        )}
      </p>
      <PillButton href="/" variant="primary" size="md" icon="arrow">
        {t('হোমে ফিরে যান', 'Back to Home')}
      </PillButton>
    </div>
  );
}
