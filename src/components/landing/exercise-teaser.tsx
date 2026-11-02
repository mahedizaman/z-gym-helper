'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { ArrowRight, Target } from 'lucide-react';
import Link from 'next/link';

interface TeaserExercise {
  id: string;
  slug: string;
  nameBn: string;
  nameEn: string;
  muscle: 'chest' | 'back' | 'shoulders' | 'legs' | 'arms' | 'core';
  muscleBn: string;
  muscleEn: string;
  equipmentBn: string;
  equipmentEn: string;
  levelBn: string;
  levelEn: string;
  tipBn: string;
  tipEn: string;
}

const TEASER_EXERCISES: TeaserExercise[] = [
  {
    id: '1',
    slug: 'barbell-bench-press',
    nameBn: 'বারবেল বেঞ্চ প্রেস',
    nameEn: 'Barbell Flat Bench Press',
    muscle: 'chest',
    muscleBn: 'বুক (চেস্ট)',
    muscleEn: 'Chest',
    equipmentBn: 'বারবেল',
    equipmentEn: 'Barbell',
    levelBn: 'ইন্টারমিডিয়েট',
    levelEn: 'Intermediate',
    tipBn: 'কনুই ৭৫ ডিগ্রি কোণে রাখুন, পিঠ অতিরিক্ত বাঁকাবেন না।',
    tipEn: 'Keep elbows at a 75-degree angle; do not overarch lower back.',
  },
  {
    id: '2',
    slug: 'incline-dumbbell-press',
    nameBn: 'ইনক্লাইন ডাম্বেল প্রেস',
    nameEn: 'Incline Dumbbell Press',
    muscle: 'chest',
    muscleBn: 'বুক (উপরের অংশ)',
    muscleEn: 'Upper Chest',
    equipmentBn: 'ডাম্বেল',
    equipmentEn: 'Dumbbell',
    levelBn: 'সব লেভেল',
    levelEn: 'All Levels',
    tipBn: 'বেঞ্চের কোণ ৩০ ডিগ্রিতে রাখলে কাঁধের চাপ কমে চেস্টে বেশি লোড পড়ে।',
    tipEn: 'Set bench to 30 degrees to maximize clavicular head activation.',
  },
  {
    id: '3',
    slug: 'lat-pulldown',
    nameBn: 'ল্যাট পুলডাউন',
    nameEn: 'Lat Pulldown (Wide Grip)',
    muscle: 'back',
    muscleBn: 'পিঠ (ল্যাটস)',
    muscleEn: 'Back (Lats)',
    equipmentBn: 'কেবল মেশিন',
    equipmentEn: 'Cable Machine',
    levelBn: 'বিগিনার ফ্রেন্ডলি',
    levelEn: 'Beginner Friendly',
    tipBn: 'বুক উঁচু রাখুন এবং বার বুকের উপরের অংশে টেনে আনুন।',
    tipEn: 'Drive elbows down and back; pull to upper chest level.',
  },
  {
    id: '4',
    slug: 'barbell-bent-over-row',
    nameBn: 'বারবেল বেন্ট ওভার রো',
    nameEn: 'Bent Over Barbell Row',
    muscle: 'back',
    muscleBn: 'পিঠ (মিড ব্যাক)',
    muscleEn: 'Mid Back & Lats',
    equipmentBn: 'বারবেল',
    equipmentEn: 'Barbell',
    levelBn: 'ইন্টারমিডিয়েট',
    levelEn: 'Intermediate',
    tipBn: 'হাঁটু সামান্য বাঁকা রেখে মেরুদণ্ড সোজা রাখুন।',
    tipEn: 'Hinge at hips, keep spine neutral, and pull to lower ribcage.',
  },
  {
    id: '5',
    slug: 'dumbbell-overhead-press',
    nameBn: 'ডাম্বেল শোল্ডার প্রেস',
    nameEn: 'Dumbbell Shoulder Press',
    muscle: 'shoulders',
    muscleBn: 'কাঁধ (অ্যান্টেরিয়র ডেল্ট)',
    muscleEn: 'Shoulders',
    equipmentBn: 'ডাম্বেল',
    equipmentEn: 'Dumbbells',
    levelBn: 'সব লেভেল',
    levelEn: 'All Levels',
    tipBn: 'মাথার উপরে তোলার সময় কোর শক্ত রাখুন।',
    tipEn: 'Brace your core to prevent lower back hyperextension.',
  },
  {
    id: '6',
    slug: 'lateral-raises',
    nameBn: 'ডাম্বেল ল্যাটারাল রেইজ',
    nameEn: 'Dumbbell Lateral Raise',
    muscle: 'shoulders',
    muscleBn: 'কাঁধ (সাইড ডেল্ট)',
    muscleEn: 'Side Deltoids',
    equipmentBn: 'ডাম্বেল',
    equipmentEn: 'Dumbbells',
    levelBn: 'বিগিনার ফ্রেন্ডলি',
    levelEn: 'Beginner Friendly',
    tipBn: 'ভারী ওজনের চেয়ে সঠিক ফর্ম ও নিয়ন্ত্রিত মুভমেন্ট বেশি জরুরি।',
    tipEn: 'Lead with elbows, avoid using body momentum or shrugging.',
  },
  {
    id: '7',
    slug: 'barbell-back-squat',
    nameBn: 'বারবেল ব্যাক স্কোয়াট',
    nameEn: 'Barbell Back Squat',
    muscle: 'legs',
    muscleBn: 'পা (কোয়াডস ও গ্লুটস)',
    muscleEn: 'Quads & Glutes',
    equipmentBn: 'বারবেল',
    equipmentEn: 'Barbell',
    levelBn: 'ইন্টারমিডিয়েট',
    levelEn: 'Intermediate',
    tipBn: 'হাঁটু পায়ের আঙুলের দিকে প্রসারিত রাখুন এবং পূর্ণ গভীরতায় নামুন।',
    tipEn: 'Keep knees tracking over toes and hit parallel depth cleanly.',
  },
  {
    id: '8',
    slug: 'romanian-deadlift',
    nameBn: 'রোমানিয়ান ডেডলিফ্ট (RDL)',
    nameEn: 'Romanian Deadlift (RDL)',
    muscle: 'legs',
    muscleBn: 'পা (হ্যামস্ট্রিং ও গ্লুটস)',
    muscleEn: 'Hamstrings & Glutes',
    equipmentBn: 'বারবেল / ডাম্বেল',
    equipmentEn: 'Barbell / Dumbbell',
    levelBn: 'ইন্টারমিডিয়েট',
    levelEn: 'Intermediate',
    tipBn: 'হিপস পিছনের দিকে ঠেলে হ্যামস্ট্রিংয়ের টান অনুভব করুন।',
    tipEn: 'Push hips backward until you feel a deep hamstring stretch.',
  },
  {
    id: '9',
    slug: 'hanging-leg-raise',
    nameBn: 'হ্যাংগিং লেগ রেইজ',
    nameEn: 'Hanging Leg Raise',
    muscle: 'core',
    muscleBn: 'কোর ও অ্যাবস',
    muscleEn: 'Abs & Core',
    equipmentBn: 'পুল-আপ বার',
    equipmentEn: 'Pull-up Bar',
    levelBn: 'ইন্টারমিডিয়েট',
    levelEn: 'Intermediate',
    tipBn: 'দুলবেন না, পেটের পেশি সংকুচিত করে পা তুলুন।',
    tipEn: 'Avoid swinging; initiate the movement by curling your pelvis.',
  },
];

export function ExerciseTeaser() {
  const { t, locale } = useLanguage();
  const [activeMuscle, setActiveMuscle] = useState<string>('all');

  const categories = [
    { id: 'all', labelBn: 'সব ব্যায়াম', labelEn: 'All Core' },
    { id: 'chest', labelBn: 'বুক (Chest)', labelEn: 'Chest' },
    { id: 'back', labelBn: 'পিঠ (Back)', labelEn: 'Back' },
    { id: 'shoulders', labelBn: 'কাঁধ (Shoulders)', labelEn: 'Shoulders' },
    { id: 'legs', labelBn: 'পা (Legs)', labelEn: 'Legs' },
    { id: 'core', labelBn: 'কোর (Core)', labelEn: 'Core' },
  ];

  const filtered =
    activeMuscle === 'all'
      ? TEASER_EXERCISES
      : TEASER_EXERCISES.filter((e) => e.muscle === activeMuscle);

  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 bg-secondary/30 border-y border-border">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-lime-soft border border-lime-brand/30 text-ink-base text-xs font-bold uppercase tracking-wider mb-4">
            <Target className="w-3.5 h-3.5" />
            <span>{t('সঠিক ফর্ম ও লাইব্রেরি', 'Exercise Guide & Form')}</span>
          </div>
          <h2 className="font-display font-black text-fluid-section uppercase tracking-tight text-foreground">
            {t('৩০+ কোর ব্যায়ামের ফর্ম গাইড', 'CORE EXERCISE FORM LIBRARY')}
          </h2>
          <p className="mt-3 text-base text-muted-foreground max-w-xl mx-auto">
            {t(
              'টার্গেট পেশি অনুযায়ী ব্যায়াম খুঁজুন, সাধারণ ভুল এড়িয়ে চলুন এবং সঠিক কৌশল রপ্ত করুন।',
              'Explore core movements by target muscle with form cues, required equipment, and video demos.'
            )}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveMuscle(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer ${
                activeMuscle === cat.id
                  ? 'bg-lime-brand text-ink-base shadow-sm font-black'
                  : 'bg-card hover:bg-secondary text-muted-foreground border border-border'
              }`}
            >
              {locale === 'bn' ? cat.labelBn : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Exercises Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filtered.slice(0, 6).map((ex) => (
            <div
              key={ex.id}
              className="flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-card border border-border shadow-sm hover:border-lime-brand/60 transition-all duration-300"
            >
              <div>
                {/* Badges */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-[11px] font-extrabold uppercase px-3 py-1 rounded-full bg-secondary text-foreground">
                    {locale === 'bn' ? ex.muscleBn : ex.muscleEn}
                  </span>
                  <span className="text-[11px] font-bold text-muted-foreground">
                    {locale === 'bn' ? ex.equipmentBn : ex.equipmentEn}
                  </span>
                </div>

                {/* Name */}
                <h3 className="font-display font-black text-2xl uppercase tracking-tight text-foreground mb-3">
                  {locale === 'bn' ? ex.nameBn : ex.nameEn}
                </h3>

                {/* Form Tip */}
                <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/60 text-xs text-muted-foreground leading-relaxed">
                  <span className="font-bold text-foreground block mb-1">
                    {t('💡 গুরুত্বপূর্ণ ফর্ম টিপ:', '💡 Form Cue:')}
                  </span>
                  {locale === 'bn' ? ex.tipBn : ex.tipEn}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs font-bold text-lime-hover">
                  {locale === 'bn' ? ex.levelBn : ex.levelEn}
                </span>
                <Link
                  href={`/exercises`}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-foreground hover:text-lime-brand transition-colors uppercase tracking-wider"
                >
                  <span>{t('গাইড দেখুন', 'View Guide')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-12 text-center">
          <Link
            href="/exercises"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-lime-brand text-ink-base font-display font-black uppercase text-sm tracking-wider hover:bg-lime-hover shadow-lg transition-all"
          >
            <span>{t('সম্পূর্ণ ব্যায়াম লাইব্রেরি দেখুন (৩০+ গাইড)', 'Explore Complete Exercise Library (30+ Guides)')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
