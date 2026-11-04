'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  qBn: string;
  qEn: string;
  aBn: string;
  aEn: string;
}

const FAQS: FAQItem[] = [
  {
    qBn: 'জেড-জিম হেল্পার ব্যবহার কি ফ্রি? কোনো গোপন সাবস্ক্রিপশন ফি আছে কি?',
    qEn: 'Is Z-Gym Helper free to use? Are there any hidden subscription costs?',
    aBn: 'হ্যাঁ, জেড-জিম হেল্পার ব্যবহার সম্পূর্ণ ফ্রি। ক্যালকুলেটর, ৩০০+ দেশি খাবারের ডেটাবেজ, জিম স্প্লিট এবং স্ট্রিক ট্র্যাকার ব্যবহার করার জন্য কোনো সাবস্ক্রিপশন ফি দিতে হয় না। কোনো পেওয়াল নেই।',
    aEn: 'Yes, Z-Gym Helper is free to use and built on open data. All calculators, the 300+ local food database, workout splits, and streak trackers are accessible without subscriptions or paywalls.',
  },
  {
    qBn: 'বাংলাদেশী খাবারের ক্যালোরি ও পুষ্টির তথ্য কোথা থেকে নেওয়া হয়েছে?',
    qEn: 'Where does the Bangladeshi food nutrition data come from?',
    aBn: 'আমাদের পুষ্টিমান উন্মুক্ত পুষ্টি ডেটাবেজ ও দেশীয় রান্নার মানসম্মত অনুমানের ভিত্তিতে সংকলিত। প্রতিটি খাবারের সাথে তার উৎস উল্লেখ রয়েছে এবং কোনটি বিশেষজ্ঞ দ্বারা যাচাইকৃত আর কোনটি প্রাথমিক অনুমান তা স্বচ্ছভাবে ফ্ল্যাগ করা রয়েছে।',
    aEn: 'Our nutrition data is compiled from open food datasets and standardized culinary estimates. Each item notes its source and transparently indicates whether values are verified or preliminary estimates pending human review.',
  },
  {
    qBn: 'অ্যাকাউন্ট বা রেজিস্ট্রেশন না করেই কি আমি এটি ব্যবহার করতে পারব?',
    qEn: 'Can I use the app without creating an account or logging in?',
    aBn: 'অবশ্যই! আমাদের নীতি হচ্ছে "গেস্ট-ফার্স্ট"। আপনি কোনো লগইন বা ইমেইল ছাড়াই সব ক্যালকুলেটর ও খাবার অনুসন্ধান ব্যবহার করতে পারবেন। আপনার ব্রাউজারের লোকাল স্টোরেজে ডেটা সেভ থাকবে। একাধিক ডিভাইসে ব্যাকআপ রাখতে চাইলে পরবর্তীতে লগইন করতে পারবেন।',
    aEn: 'Absolutely! We follow a guest-first philosophy. All calculators, food macros, and split pickers work instantly without requiring signup. Your data persists locally in your browser.',
  },
  {
    qBn: 'ডেইলি স্ট্রিক কীভাবে হিসাব হয়? টাইমজোন সমস্যা হবে কি?',
    qEn: 'How does daily streak tracking work? What about timezones?',
    aBn: 'আমাদের সিস্টেম সরাসরি এশিয়া/ঢাকা (UTC+6) স্থানীয় সময়ের সাথে যুক্ত। আপনি প্রতিদিন একটি মিল বা ব্যায়াম লগ করলে সেই দিনের স্ট্রিক চালু থাকে। রাত ১২টায় ঢাকাইয়া তারিখ পরিবর্তনের সাথে সাথে ধারাবাহিক হিসাব বজায় থাকে।',
    aEn: 'Our streak algorithm computes exclusively in the Asia/Dhaka (UTC+6) timezone. Logging a meal or workout preserves your daily streak, with midnight resets tied cleanly to Bangladesh standard time.',
  },
  {
    qBn: 'আমি কীভাবে এটি আমার অ্যান্ড্রয়েড বা আইফোনে ইনস্টল করব?',
    qEn: 'How do I install Z-Gym Helper on my Android or iPhone?',
    aBn: 'এটি একটি প্রগ্রেসিভ ওয়েব অ্যাপ (PWA)। ক্রোম বা সাফারি ব্রাউজারে সাইটটিতে প্রবেশ করে "Add to Home Screen" বা ব্রাউজার মেনুর "Install" অপশনে ট্যাপ করলেই এটি আপনার ফোনের অ্যাপ লিস্টে চলে আসবে এবং অফলাইনেও চলবে।',
    aEn: 'Z-Gym Helper is an installable PWA. In Chrome or Safari, tap "Add to Home Screen" or "Install App". It installs directly to your home screen with offline capability.',
  },
  {
    qBn: 'এখানে দেখানো ক্যালোরি ও ওজন কমানোর লক্ষ্য কি ডাক্তারের পরামর্শের বিকল্প?',
    qEn: 'Are these caloric calculations a substitute for professional medical advice?',
    aBn: 'না। জেড-জিম হেল্পারে প্রদত্ত BMR, TDEE এবং ডায়েট ক্যালকুলেশন সাধারণ স্বাস্থ্যকর তথ্যের ভিত্তিতে বিজ্ঞানসম্মত অনুমান। বিশেষ স্বাস্থ্যগত সমস্যা বা চরম ক্যালোরি ঘাটতির আগে সর্বদা প্রত্যয়িত পুষ্টিবিদ বা ডাক্তারের পরামর্শ নিন।',
    aEn: 'No. The BMR, TDEE, and MET burn values are evidence-based estimates for fitness guidance. They do not constitute medical diagnosis. Always consult certified physicians or dietitians for medical conditions.',
  },
];

export function FAQSection() {
  const { t, locale } = useLanguage();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 bg-secondary/30 border-t border-border">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-secondary border border-border text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-lime-brand" />
            <span>{t('সচরাচর জিজ্ঞাসিত প্রশ্ন', 'Frequently Asked Questions')}</span>
          </div>
          <h2 className="font-display font-black text-fluid-section uppercase tracking-tight text-foreground">
            {t('আপনার প্রশ্নের উত্তর', 'QUESTIONS & ANSWERS')}
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            {t('জেড-জিম হেল্পার সম্পর্কে আপনার যা কিছু জানা দরকার।', 'Everything you need to know about Z-Gym Helper.')}
          </p>
        </div>

        {/* Accordion List */}
        <div className="flex flex-col gap-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;

            return (
              <div
                key={`faq-${idx}`}
                className="rounded-3xl bg-card border border-border overflow-hidden transition-all duration-200 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-6 sm:p-7 text-left font-display font-extrabold text-lg sm:text-xl uppercase text-foreground hover:text-lime-hover transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="pr-4">{locale === 'bn' ? faq.qBn : faq.qEn}</span>
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen
                        ? 'rotate-180 bg-lime-brand text-ink-base'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                      <div className="px-6 sm:px-7 pb-6 sm:pb-7 text-sm sm:text-base text-muted-foreground leading-relaxed border-t border-border/40 pt-4">
                        {locale === 'bn' ? faq.aBn : faq.aEn}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
