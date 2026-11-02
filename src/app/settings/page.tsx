'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';
import { PillButton } from '@/components/motion/pill-button';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-20 text-center">
      <div className="w-16 h-16 rounded-3xl bg-secondary text-foreground mx-auto mb-6 flex items-center justify-center border border-border shadow-sm">
        <Settings className="w-8 h-8 text-lime-brand" />
      </div>
      <h1 className="font-display font-black text-4xl sm:text-5xl uppercase text-foreground mb-4">
        {t('অ্যাপ সেটিংস', 'App Settings')}
      </h1>
      <p className="text-muted-foreground max-w-xl mx-auto mb-8">
        {t(
          'ভাষা, থিম, পুশ নোটিফিকেশন রিমাইন্ডার ও অ্যাকাউন্ট সেটিংস।',
          'Manage language preference, dark/light theme, notification schedules, and local storage.'
        )}
      </p>
      <PillButton href="/" variant="primary" size="md" icon="arrow">
        {t('হোমে ফিরে যান', 'Back to Home')}
      </PillButton>
    </div>
  );
}
