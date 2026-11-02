'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';
import { PillButton } from '@/components/motion/pill-button';
import { Utensils } from 'lucide-react';

export default function FoodsPage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-20 text-center">
      <div className="w-16 h-16 rounded-3xl bg-lime-soft text-ink-base mx-auto mb-6 flex items-center justify-center border border-lime-brand/30 shadow-sm">
        <Utensils className="w-8 h-8" />
      </div>
      <h1 className="font-display font-black text-4xl sm:text-5xl uppercase text-foreground mb-4">
        {t('৩০০+ দেশি খাবার পুষ্টি ডেটাবেজ', '300+ Bangladeshi Food Database')}
      </h1>
      <p className="text-muted-foreground max-w-xl mx-auto mb-8">
        {t(
          'ভাত, ডাল, মাছ, মাংস ও ঐতিহ্যবাহী বাংলাদেশী খাবারের পূর্ণাঙ্গ পুষ্টি তালিকা লোড হচ্ছে...',
          'Loading full nutritional profiles for authentic Bangladeshi dishes and staples...'
        )}
      </p>
      <PillButton href="/" variant="primary" size="md" icon="arrow">
        {t('হোমে ফিরে যান', 'Back to Home')}
      </PillButton>
    </div>
  );
}
