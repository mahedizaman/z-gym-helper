'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';
import { PillButton } from '@/components/motion/pill-button';
import { Trophy } from 'lucide-react';

export default function ChallengesPage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-20 text-center">
      <div className="w-16 h-16 rounded-3xl bg-pink-soft text-pink-brand mx-auto mb-6 flex items-center justify-center border border-pink-brand/30 shadow-sm">
        <Trophy className="w-8 h-8" />
      </div>
      <h1 className="font-display font-black text-4xl sm:text-5xl uppercase text-foreground mb-4">
        {t('ফ্রেন্ডস চ্যালেঞ্জ গ্রুপ', 'Friend Challenge Groups')}
      </h1>
      <p className="text-muted-foreground max-w-xl mx-auto mb-8">
        {t(
          '২ থেকে ১০ জন বন্ধুর সাথে প্রাইভেট কোড দিয়ে ৭, ১৪ বা ৩০ দিনের ফিটনেস চ্যালেঞ্জ শুরু করুন।',
          'Create private challenge groups with 2-10 friends via invite code /c/[code].'
        )}
      </p>
      <PillButton href="/" variant="primary" size="md" icon="arrow">
        {t('হোমে ফিরে যান', 'Back to Home')}
      </PillButton>
    </div>
  );
}
