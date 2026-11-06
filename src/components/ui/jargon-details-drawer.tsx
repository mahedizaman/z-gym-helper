'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';
import { Z_INDEX } from '@/config/z-index';
import { Info, X, Heart, Activity, Flame, Zap, Apple } from 'lucide-react';

interface JargonDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JargonDetailsDrawer({ isOpen, onClose }: JargonDetailsDrawerProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const terms = [
    {
      icon: Heart,
      abbr: 'BMR',
      nameBn: 'বিশ্রামে স্বাভাবিক খরচ',
      nameEn: 'Basal Metabolic Rate',
      descBn:
        'কোনো কায়িক পরিশ্রম না করে বিছানায় শুয়ে থাকলেও হৃৎপিণ্ড, ফুসফুস ও কোষগুলো সচল রাখতে শরীর যে নূন্যতম শক্তি খরচ করে।',
      descEn:
        'The baseline calories your body burns at complete rest just to keep essential organs functioning.',
      color: 'text-tomato-base bg-tomato-base/15',
    },
    {
      icon: Activity,
      abbr: 'TDEE',
      nameBn: 'সারাদিনের মোট শক্তি খরচ',
      nameEn: 'Total Daily Energy Expenditure',
      descBn:
        'বিশ্রামের খরচের (BMR) সাথে আপনার দৈনন্দিন অফিস, হাঁটাচলা ও স্বাভাবিক রুটিন যোগ করে সারাদিনের মোট ক্যালোরি খরচ।',
      descEn:
        'Total daily calories burned factoring in your daily routine, walking, and normal activities.',
      color: 'text-lime-brand bg-lime-brand/15',
    },
    {
      icon: Flame,
      abbr: 'Deficit',
      nameBn: 'ওজন কমানোর ক্যালোরি ঘাটতি',
      nameEn: 'Caloric Deficit',
      descBn:
        'সুস্থভাবে চর্বি কমাতে শরীরের স্বাভাবিক খরচের চেয়ে প্রতিদিন ৩০০-৫০০ ক্যালোরি কম খাওয়া বা ব্যায়ামে পোড়ানো হয়। ১ কেজি চর্বি কমাতে প্রায় ৭৭০০ ক্যালোরি ঘাটতি তৈরি করতে হয়।',
      descEn:
        'Eating 300-500 kcal below maintenance or burning it with exercise to safely lose body fat.',
      color: 'text-thunder-base bg-thunder-base/15',
    },
    {
      icon: Zap,
      abbr: 'MET',
      nameBn: 'ব্যায়ামের তীব্রতা ও গতি',
      nameEn: 'Metabolic Equivalent of Task',
      descBn:
        'বিশ্রামরত অবস্থার তুলনায় কোনো নির্দিষ্ট ব্যায়াম বা খেলাধুলায় শরীর কত গুণ দ্রুত ক্যালোরি খরচ করে তার মাপ। যেমন: দ্রুত হাঁটা ৩.৮ গুণ, সাইক্লিং ৬ গুণ।',
      descEn:
        'How many times faster an exercise burns energy compared to resting quietly.',
      color: 'text-lime-brand bg-lime-brand/15',
    },
    {
      icon: Apple,
      abbr: 'Fiber',
      nameBn: 'দৈনিক আঁশ (ফাইবার)',
      nameEn: 'Dietary Fiber',
      descBn:
        'হজম ভালো রাখা, পেট দীর্ঘক্ষণ ভরা রাখা ও রক্তে সুগার নিয়ন্ত্রণে রাখতে প্রতি ১,০০০ ক্যালোরির জন্য প্রায় ১৪ গ্রাম ফাইবার খাওয়া উপকারী।',
      descEn:
        'About 14g of fiber per 1000 kcal supports digestion, steady blood sugar, and satiety.',
      color: 'text-lime-brand bg-lime-brand/15',
    },
  ];

  return (
    <div
      style={{ zIndex: Z_INDEX.modal }}
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-background text-foreground border border-border rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          type="button"
          aria-label={t('বন্ধ করুন', 'Close')}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-secondary text-lime-brand flex items-center justify-center shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight">
              {t('সহজ ভাষায় ক্যালোরি ও পুষ্টি নির্দেশিকা', 'Plain Language Nutrition & Health Guide')}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t('জটিল টার্মগুলোর সহজ বৈজ্ঞানিক ব্যাখ্যা', 'Simple explanations of health terms without the jargon')}
            </p>
          </div>
        </div>

        <div className="space-y-3.5">
          {terms.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.abbr}
                className="p-4 rounded-2xl bg-secondary/35 border border-border/70 space-y-1.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-sm text-foreground">
                      {t(item.nameBn, item.nameEn)}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      ({item.abbr})
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pl-9">
                  {t(item.descBn, item.descEn)}
                </p>
              </div>
            );
          })}
        </div>

        <div className="pt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full text-xs font-bold bg-lime-brand text-ink-base hover:bg-lime-hover transition-colors cursor-pointer"
          >
            {t('বুঝেছি', 'Got it')}
          </button>
        </div>
      </div>
    </div>
  );
}
