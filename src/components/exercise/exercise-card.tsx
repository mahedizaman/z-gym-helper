'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Dumbbell, ArrowRight, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export interface ExerciseCardProps {
  slug: string;
  nameBn: string;
  nameEn: string;
  muscle: string;
  secondaryMuscles?: string[];
  equipment: string;
  level: string;
  images?: string[];
  reviewed?: boolean;
}

export function ExerciseCard({
  slug,
  nameBn,
  nameEn,
  muscle,
  equipment,
  level,
  images = [],
  reviewed = false,
}: ExerciseCardProps) {
  const { t } = useLanguage();
  const [imageError, setImageError] = useState(false);

  const muscleLabels: Record<string, { bn: string; en: string }> = {
    chest: { bn: 'বুক', en: 'Chest' },
    back: { bn: 'পিঠ', en: 'Back' },
    shoulders: { bn: 'কাঁধ', en: 'Shoulders' },
    arms: { bn: 'হাত', en: 'Arms' },
    legs: { bn: 'পা', en: 'Legs' },
    core: { bn: 'কোর', en: 'Core' },
  };

  const levelLabels: Record<string, { bn: string; en: string; color: string }> = {
    beginner: { bn: 'সহজ', en: 'Beginner', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
    intermediate: { bn: 'মধ্যম', en: 'Intermediate', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
    advanced: { bn: 'উন্নত', en: 'Advanced', color: 'bg-tomato-base/10 text-tomato-base border-tomato-base/20' },
  };

  const equipmentLabels: Record<string, { bn: string; en: string }> = {
    barbell: { bn: 'বারবেল', en: 'Barbell' },
    dumbbell: { bn: 'ডাম্বেল', en: 'Dumbbell' },
    cable: { bn: 'কেবল', en: 'Cable' },
    machine: { bn: 'মেশিন', en: 'Machine' },
    bodyweight: { bn: 'বডিওয়েট', en: 'Bodyweight' },
  };

  const primaryImage = images[0];

  return (
    <div className="group rounded-3xl border border-border bg-card p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:border-lime-brand/50 hover:-translate-y-1">
      <div>
        {/* Visual Preview / Thumbnail */}
        <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-muted/60 mb-4 flex items-center justify-center">
          {primaryImage && !imageError ? (
            <Image
              src={primaryImage}
              alt={nameEn}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground p-6">
              <Dumbbell className="w-12 h-12 stroke-1 text-muted-foreground/60 mb-2" />
              <span className="text-xs uppercase tracking-wider font-semibold">Free-Exercise-DB</span>
            </div>
          )}

          {/* Badges overlay */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-ink-base/80 text-white backdrop-blur-md border border-white/10">
              {t(muscleLabels[muscle]?.bn || muscle, muscleLabels[muscle]?.en || muscle)}
            </span>
          </div>

          <div className="absolute top-3 right-3 z-10">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border backdrop-blur-md ${
                levelLabels[level]?.color || 'bg-muted text-foreground'
              }`}
            >
              {t(levelLabels[level]?.bn || level, levelLabels[level]?.en || level)}
            </span>
          </div>

          {/* Review status notice badge */}
          {!reviewed && (
            <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-[11px] text-amber-300 border border-amber-500/30">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span className="truncate">
                {t('যাচাই প্রক্রিয়াধীন (AI খসড়া)', 'Reviewing (AI Draft)')}
              </span>
            </div>
          )}
        </div>

        {/* Exercise Information */}
        <div className="space-y-1 mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="capitalize">
              {t(equipmentLabels[equipment]?.bn || equipment, equipmentLabels[equipment]?.en || equipment)}
            </span>
          </div>
          <h3 className="font-display font-black text-xl text-foreground group-hover:text-lime-brand transition-colors">
            {nameBn}
          </h3>
          <p className="text-xs font-medium text-muted-foreground">
            {nameEn}
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-border/60 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {t('স্টেপ-বাই-স্টেপ ফর্ম গাইড', 'Step-by-step form guide')}
        </span>
        <Link
          href={`/exercises/${slug}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-ink-base bg-lime-brand hover:bg-lime-hover px-3 py-1.5 rounded-full transition-colors group-hover:shadow-md"
        >
          {t('গাইড দেখুন', 'View Guide')}
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
