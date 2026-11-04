'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Dumbbell,
  Target,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { YouTubeEmbed } from '@/components/exercise/youtube-embed';
import { SeedExercise } from '@/server/seeds/exercises.data';

interface ExerciseDetailClientProps {
  exercise: SeedExercise & { images: string[] };
}

export function ExerciseDetailClient({ exercise }: ExerciseDetailClientProps) {
  const { t, locale } = useLanguage();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const muscleLabels: Record<string, { bn: string; en: string }> = {
    chest: { bn: 'বুক (Chest)', en: 'Chest' },
    back: { bn: 'পিঠ (Back)', en: 'Back' },
    shoulders: { bn: 'কাঁধ (Shoulders)', en: 'Shoulders' },
    arms: { bn: 'হাত (Arms)', en: 'Arms' },
    legs: { bn: 'পা (Legs)', en: 'Legs' },
    core: { bn: 'কোর (Core)', en: 'Core' },
  };

  const levelLabels: Record<string, { bn: string; en: string; color: string }> = {
    beginner: {
      bn: 'সহজ (Beginner)',
      en: 'Beginner',
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    },
    intermediate: {
      bn: 'মধ্যম (Intermediate)',
      en: 'Intermediate',
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    },
    advanced: {
      bn: 'উন্নত (Advanced)',
      en: 'Advanced',
      color: 'bg-tomato-base/10 text-tomato-base border-tomato-base/30',
    },
  };

  const equipmentLabels: Record<string, { bn: string; en: string }> = {
    barbell: { bn: 'বারবেল', en: 'Barbell' },
    dumbbell: { bn: 'ডাম্বেল', en: 'Dumbbell' },
    cable: { bn: 'কেবল', en: 'Cable' },
    machine: { bn: 'মেশিন', en: 'Machine' },
    bodyweight: { bn: 'বডিওয়েট', en: 'Bodyweight' },
  };

  const instructions = locale === 'bn' ? exercise.instructionsBn : exercise.instructionsEn;
  const tips = locale === 'bn' ? exercise.tipsBn : exercise.tipsEn;

  return (
    <div className="space-y-8">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/exercises"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>{t('সব ব্যায়াম লাইব্রেরি', 'Back to Exercise Library')}</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/plans"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-base bg-lime-brand hover:bg-lime-hover px-4 py-2 rounded-full transition-colors shadow-sm"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t('ওয়ার্কআউট প্ল্যান দেখুন', 'View Workout Plans')}</span>
          </Link>
        </div>
      </div>

      {/* Mandatory Under Review Notice Banner */}
      {!exercise.reviewed && (
        <div className="rounded-3xl border border-amber-500/40 bg-amber-500/10 p-5 flex items-start gap-3.5 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-foreground/90 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-amber-700 dark:text-amber-400">
                {t('যাচাই প্রক্রিয়াধীন (AI খসড়া গাইড)', 'Under Review (AI Draft Guide)')}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                reviewed: false
              </span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {t(
                'এই ব্যায়ামের বাংলা নির্দেশনা ও পরামর্শগুলো প্রাথমিক এআই খসড়া হিসেবে প্রস্তুত করা হয়েছে। একজন সার্টিফায়েড ট্রেইনার দ্বারা বায়োমেকানিকাল ও ইনজুরি-প্রতিরোধ যাচাই প্রক্রিয়াধীন রয়েছে। প্রথমবার অনুশীলনের সময় অবশ্যই জিম ট্রেইনারের তত্ত্বাবধান নিন।',
                'This exercise’s Bangla cues and tips are an AI-generated draft undergoing human review by certified fitness professionals. Always exercise under qualified supervision to prevent injury.'
              )}
            </p>
          </div>
        </div>
      )}

      {/* Exercise Main Header */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Muscle Badge */}
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-ink-base text-white dark:bg-white dark:text-ink-base">
            {t(muscleLabels[exercise.muscle]?.bn || exercise.muscle, muscleLabels[exercise.muscle]?.en || exercise.muscle)}
          </span>
          {/* Equipment Badge */}
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
            {t(equipmentLabels[exercise.equipment]?.bn || exercise.equipment, equipmentLabels[exercise.equipment]?.en || exercise.equipment)}
          </span>
          {/* Level Badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              levelLabels[exercise.level]?.color || 'bg-muted text-foreground'
            }`}
          >
            {t(levelLabels[exercise.level]?.bn || exercise.level, levelLabels[exercise.level]?.en || exercise.level)}
          </span>
        </div>

        <div>
          <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-foreground">
            {exercise.nameBn}
          </h1>
          <p className="text-base sm:text-lg font-medium text-muted-foreground mt-1">
            {exercise.nameEn}
          </p>
        </div>

        {/* Secondary Muscles */}
        {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
          <div className="flex items-center gap-2 pt-2 flex-wrap">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              {t('সহায়ক পেশি:', 'Secondary Muscles:')}
            </span>
            {exercise.secondaryMuscles.map((sec) => (
              <span
                key={sec}
                className="text-xs px-2.5 py-0.5 rounded-md bg-muted/60 text-foreground border border-border/60 capitalize"
              >
                {sec.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Visual Content: Position Images & Verified Video */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Public Domain Free-Exercise-DB Positions */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-lime-brand" />
                <h3 className="font-display font-bold text-lg text-foreground">
                  {t('শারীরিক ভঙ্গি ও অবস্থান', 'Form & Position Gallery')}
                </h3>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Free-Exercise-DB (Public Domain)
              </span>
            </div>

            {/* Main Image Display */}
            {exercise.images && exercise.images.length > 0 ? (
              <div>
                <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-muted/50 border border-border">
                  <Image
                    src={exercise.images[activeImageIndex] || exercise.images[0]}
                    alt={`${exercise.nameEn} position ${activeImageIndex + 1}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                  <div className="absolute bottom-3 left-3 bg-ink-base/80 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                    {activeImageIndex === 0
                      ? t('১. শুরুর ভঙ্গি (Starting)', '1. Starting Position')
                      : t('২. শেষের ভঙ্গি (Peak Contraction)', '2. Peak Contraction')}
                  </div>
                </div>

                {/* Thumbnails to toggle between Start and Finish positions */}
                {exercise.images.length > 1 && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {exercise.images.slice(0, 2).map((imgUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative aspect-4/3 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          activeImageIndex === idx
                            ? 'border-lime-brand shadow-md scale-[1.02]'
                            : 'border-border opacity-70 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={imgUrl}
                          alt={`${exercise.nameEn} preview ${idx + 1}`}
                          fill
                          className="object-cover"
                          sizes="200px"
                        />
                        <div className="absolute inset-0 flex items-end p-2 bg-gradient-to-t from-black/70 to-transparent text-[11px] font-bold text-white">
                          {idx === 0 ? t('শুরুর অবস্থান', 'Start') : t('শেষের অবস্থান', 'Finish')}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-4/3 w-full rounded-2xl bg-muted flex items-center justify-center text-muted-foreground text-sm">
                {t('ছবি উপলব্ধ নেই', 'No images available')}
              </div>
            )}
          </div>

          {/* YouTube Video Embed: Only rendered if verified youtubeId is present */}
          {exercise.youtubeId && exercise.youtubeId.trim() !== '' && (
            <YouTubeEmbed youtubeId={exercise.youtubeId} title={exercise.nameEn} />
          )}
        </div>

        {/* Right Column: Execution Steps, Mistakes, Pro-Tips */}
        <div className="space-y-6">
          {/* Step-by-Step Instructions */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-7 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-lime-brand" />
              <h3 className="font-display font-black text-xl text-foreground">
                {t('ধাপে ধাপে ব্যায়ামের পদ্ধতি', 'Step-by-Step Execution')}
              </h3>
            </div>

            <ol className="space-y-3.5">
              {instructions.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3.5 text-sm sm:text-base leading-relaxed text-foreground/90">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-lime-soft text-ink-base font-bold text-xs shrink-0 mt-0.5 border border-lime-brand/40">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Common Mistakes to Avoid */}
          {exercise.commonMistakesBn && exercise.commonMistakesBn.length > 0 && (
            <div className="rounded-3xl border border-tomato-base/30 bg-tomato-base/5 p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-tomato-base" />
                <h3 className="font-display font-black text-xl text-tomato-base">
                  {t('সাধারণ ভুলসমূহ (এড়িয়ে চলুন)', 'Common Mistakes to Avoid')}
                </h3>
              </div>

              <ul className="space-y-2.5">
                {exercise.commonMistakesBn.map((mistake, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-foreground/90 leading-relaxed">
                    <span className="text-tomato-base font-bold text-base leading-none mt-0.5">•</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pro Tips Card - High Contrast WCAG AAA Compliant */}
          {tips && (
            <div className="rounded-3xl border-2 border-lime-brand/60 bg-[#E4FBCB] dark:bg-[#1A211E] dark:border-lime-brand/50 p-6 sm:p-7 space-y-3.5 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-lime-brand text-ink-base shrink-0 shadow-xs">
                  <Lightbulb className="w-4 h-4 text-ink-base fill-ink-base" />
                </div>
                <h3 className="font-display font-black text-xl text-[#0F1412] dark:text-[#A9F26B] tracking-tight">
                  {t('প্রো ট্রেইনার টিপস', 'Trainer Pro-Tip')}
                </h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2.5 text-base leading-relaxed text-[#0F1412] dark:text-zinc-100 font-medium">
                  <span className="text-[#0F1412] dark:text-lime-brand font-black text-lg leading-none shrink-0 mt-0.5">
                    •
                  </span>
                  <span>{tips}</span>
                </li>
              </ul>
            </div>
          )}

          {/* Call to action: Explore related plans */}
          <div className="p-6 rounded-3xl border border-border bg-muted/40 flex items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-lime-brand" />
                {t('ওয়ার্কআউট রুটিনে যোগ করতে চান?', 'Want to incorporate this?')}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t(
                  'আমাদের ৩-৬ দিনের স্প্লিট প্ল্যানে এই ব্যায়ামটি অন্তর্ভুক্ত রয়েছে।',
                  'Included in our 3 to 6-day scientifically designed workout splits.'
                )}
              </p>
            </div>
            <Link
              href="/plans"
              className="px-4 py-2 rounded-full text-xs font-bold text-ink-base bg-lime-brand hover:bg-lime-hover transition-colors whitespace-nowrap shrink-0"
            >
              {t('প্ল্যান দেখুন', 'View Plans')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
