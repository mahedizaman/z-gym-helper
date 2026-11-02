'use client';

import React from 'react';
import { Marquee } from '@/components/motion/marquee';
import { useLanguage } from '@/lib/language-context';

export function MarqueeRibbon() {
  const { t } = useLanguage();

  const items = [
    t('৩০০+ খাঁটি দেশি খাবার পুষ্টি', '300+ Authentic Bangladeshi Foods'),
    t('১০০% ফ্রি ওপেন ডেটা', '100% Free Open Data Platform'),
    t('সঠিক MIFFLIN-ST JEOR BMR', 'Precision Mifflin-St Jeor BMR'),
    t('৩/৪/৫/৬ দিনের জিম স্প্লিট', '3/4/5/6 Days Gym Workout Splits'),
    t('এশিয়া/ঢাকা টাইমজোনে স্ট্রিক', 'Asia/Dhaka Workout Streak Tracking'),
    t('অফলাইন উপযোগী PWA অ্যাপ', 'Offline Installable PWA'),
    t('কোনো পেওয়াল বা হিডেন ফি নেই', 'Zero Paywalls or Gimmicks'),
  ];

  return (
    <section className="relative w-full py-3.5 sm:py-4 bg-lime-brand text-ink-base border-y-2 border-ink-base shadow-sm overflow-hidden select-none">
      <Marquee
        items={items}
        speed={26}
        pauseOnHover={true}
        itemClassName="text-ink-base font-extrabold text-base sm:text-lg md:text-xl font-display tracking-wider"
      />
    </section>
  );
}
