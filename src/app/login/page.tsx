'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';
import { PillButton } from '@/components/motion/pill-button';
import { User, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto max-w-md px-4 py-20 text-center">
      <div className="w-16 h-16 rounded-3xl bg-secondary text-foreground mx-auto mb-6 flex items-center justify-center border border-border shadow-sm">
        <User className="w-8 h-8 text-lime-brand" />
      </div>
      <h1 className="font-display font-black text-3xl sm:text-4xl uppercase text-foreground mb-3">
        {t('লগইন / রেজিস্টার', 'Account Sign In')}
      </h1>
      <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
        {t(
          'আপনার স্থানীয় ডেটা ক্লাউডে সংরক্ষণ এবং একাধিক ডিভাইসে সিঙ্ক করার জন্য লগইন করুন।',
          'Sign in to sync your local meals, workouts, and weight history to the cloud.'
        )}
      </p>

      <div className="p-4 rounded-2xl bg-secondary/50 border border-border text-xs text-muted-foreground flex items-center gap-2 mb-8 text-left">
        <ShieldCheck className="w-5 h-5 text-lime-brand shrink-0" />
        <span>
          {t(
            'গেস্ট মোড সক্রিয়: আপনি লগইন না করেও সব ক্যালকুলেটর ও ফুড ডেটা ব্যবহার করতে পারবেন।',
            'Guest mode active: You can freely use all calculators and food tools without logging in.'
          )}
        </span>
      </div>

      <PillButton href="/" variant="primary" size="md" icon="arrow" fullWidth>
        {t('হোমে ফিরে যান', 'Back to Home')}
      </PillButton>
    </div>
  );
}
