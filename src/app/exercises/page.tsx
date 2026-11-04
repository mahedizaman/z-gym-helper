'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';
import { CORE_EXERCISES_DATA } from '@/server/seeds/exercises.data';
import { getExerciseImages } from '@/server/seeds/exercise-images.data';
import { ExerciseLibraryClient } from '@/components/exercise/exercise-library-client';
import { Sparkles } from 'lucide-react';

export default function ExercisesPage() {
  const { t } = useLanguage();

  const exercisesWithImages = CORE_EXERCISES_DATA.map((ex) => ({
    slug: ex.slug,
    nameBn: ex.nameBn,
    nameEn: ex.nameEn,
    muscle: ex.muscle,
    secondaryMuscles: ex.secondaryMuscles,
    equipment: ex.equipment,
    level: ex.level,
    images: getExerciseImages(ex.slug),
    reviewed: ex.reviewed,
  }));

  return (
    <div className="min-h-screen bg-background py-10 sm:py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime-soft text-ink-base border border-lime-brand/40 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-ink-base" />
            <span>{t('৩৩টি সায়েন্টিফিক ব্যায়াম', '33 Scientific Movements')}</span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-foreground mb-4">
            {t('ব্যায়াম লাইব্রেরি ও ফর্ম গাইড', 'Exercise Form & Library')}
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            {t(
              'বুক, পিঠ, কাঁধ, হাত, পা ও কোর পেশির বায়োমেকানিক্স, সাধারণ ভুল, প্রো-টিপস এবং ভিডিও ডেমো।',
              'Master biomechanics for chest, back, shoulders, arms, legs and core with execution steps, common mistakes, and video demos.'
            )}
          </p>
        </div>

        {/* Interactive Library */}
        <ExerciseLibraryClient initialExercises={exercisesWithImages} />
      </div>
    </div>
  );
}
