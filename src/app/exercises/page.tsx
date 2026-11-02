'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';
import { PillButton } from '@/components/motion/pill-button';
import { BookOpen } from 'lucide-react';

export default function ExercisesPage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-20 text-center">
      <div className="w-16 h-16 rounded-3xl bg-lime-soft text-ink-base mx-auto mb-6 flex items-center justify-center border border-lime-brand/30 shadow-sm">
        <BookOpen className="w-8 h-8" />
      </div>
      <h1 className="font-display font-black text-4xl sm:text-5xl uppercase text-foreground mb-4">
        {t('ব্যায়াম লাইব্রেরি ও ফর্ম গাইড', 'Exercise Form Library')}
      </h1>
      <p className="text-muted-foreground max-w-xl mx-auto mb-8">
        {t(
          '৩০+ কোর ব্যায়ামের ছবি, কমন ভুল, টার্গেট পেশি এবং ইউটিউব ভিডিও ফ্যাসাড।',
          'Explore core compound and isolation movements with form cues and muscle targeting.'
        )}
      </p>
      <PillButton href="/" variant="primary" size="md" icon="arrow">
        {t('হোমে ফিরে যান', 'Back to Home')}
      </PillButton>
    </div>
  );
}
