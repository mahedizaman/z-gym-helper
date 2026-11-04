'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import {
  guestStorage,
  type GuestExerciseBurn,
} from '@/lib/guest-storage';
import { calculateExerciseBurn } from '@/server/services/calculations';
import { NumberField } from '@/components/ui/number-field';
import { Flame, Plus, Trash2, Activity } from 'lucide-react';

interface ExerciseBurnSectionProps {
  userWeightKg: number;
  burns: GuestExerciseBurn[];
  onBurnsUpdated: (burns: GuestExerciseBurn[]) => void;
}

const EXERCISE_OPTIONS = [
  { id: 'weightlifting', nameBn: 'জিম ও ওয়েটলিফটিং', nameEn: 'Weight Training / Gym', met: 5.0 },
  { id: 'running_8kmh', nameBn: 'দৌড়ানো (৮ কিমি/ঘণ্টা)', nameEn: 'Running (8 km/h)', met: 8.3 },
  { id: 'cycling_mod', nameBn: 'সাইক্লিং (মাঝারি গতি)', nameEn: 'Cycling (Moderate Pace)', met: 6.0 },
  { id: 'jump_rope', nameBn: 'দড়ি লাফ (Jump Rope)', nameEn: 'Jump Rope', met: 10.0 },
  { id: 'walking_brisk', nameBn: 'দ্রুত হাঁটা (৫ কিমি/ঘণ্টা)', nameEn: 'Brisk Walking (5 km/h)', met: 3.8 },
  { id: 'swimming', nameBn: 'সাঁতার কাটা (Swimming)', nameEn: 'Swimming (Freestyle)', met: 7.0 },
  { id: 'calisthenics_hiit', nameBn: 'ক্যালিসথেনিক্স / এইচআইআইটি', nameEn: 'Calisthenics / HIIT', met: 8.0 },
];

export function ExerciseBurnSection({
  userWeightKg,
  burns,
  onBurnsUpdated,
}: ExerciseBurnSectionProps) {
  const { t, locale } = useLanguage();
  const [selectedExId, setSelectedExId] = useState<string>('weightlifting');
  const [durationMinStr, setDurationMinStr] = useState<string>('45');

  const selectedExercise =
    EXERCISE_OPTIONS.find((e) => e.id === selectedExId) || EXERCISE_OPTIONS[0];

  const parsedDuration = durationMinStr.trim() === '' ? 0 : parseFloat(durationMinStr);
  const durationMin = !isNaN(parsedDuration) && parsedDuration > 0 ? parsedDuration : 0;

  const estimatedBurn =
    durationMin > 0
      ? calculateExerciseBurn(selectedExercise.met, userWeightKg, durationMin)
      : 0;

  const handleAddBurn = () => {
    if (durationMin <= 0) return;
    const date = guestStorage.getDhakaDateString();
    const updated = guestStorage.addExerciseBurn(date, {
      nameBn: selectedExercise.nameBn,
      nameEn: selectedExercise.nameEn,
      met: selectedExercise.met,
      durationMinutes: Math.round(durationMin),
      burnedKcal: estimatedBurn,
    });
    onBurnsUpdated(updated);
  };

  const handleRemoveBurn = (burnId: string) => {
    const date = guestStorage.getDhakaDateString();
    const updated = guestStorage.removeExerciseBurn(date, burnId);
    onBurnsUpdated(updated);
  };

  const totalBurned = burns.reduce((acc, b) => acc + b.burnedKcal, 0);

  return (
    <div className="rounded-3xl bg-card border border-border p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-tomato-brand/10 text-tomato-brand flex items-center justify-center border border-tomato-brand/20">
            <Flame className="w-5 h-5 fill-tomato-brand" />
          </div>
          <div>
            <h3 className="font-display font-black text-xl uppercase tracking-tight text-foreground">
              {t('ব্যায়াম ও ক্যালোরি বার্ন হিসাব (MET)', 'Exercise & Calorie Burn (MET)')}
            </h3>
            <span className="text-xs text-muted-foreground">
              {t('MET × ওজন(কেজি) × সময় সূত্রের মাধ্যমে আনুমানিক হিসাব', 'Estimated via MET × Weight(kg) × Hours formula')}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            {t('আজকের ব্যায়ামে বার্ন', 'Burned Today')}
          </span>
          <span className="font-display font-black text-2xl text-tomato-brand">
            {totalBurned} kcal
          </span>
        </div>
      </div>

      {/* Add Exercise Form */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mt-5">
        <div className="sm:col-span-6">
          <label className="text-xs font-bold text-muted-foreground block mb-1">
            {t('ব্যায়াম বেছে নিন', 'Select Exercise')}
          </label>
          <select
            value={selectedExId}
            onChange={(e) => setSelectedExId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/80 border border-border text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-lime-brand"
          >
            {EXERCISE_OPTIONS.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {locale === 'bn' ? ex.nameBn : ex.nameEn} (MET {ex.met})
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <NumberField
            id="exercise-duration"
            label={<span className="text-xs font-bold text-muted-foreground">{t('সময়কাল (মিনিট)', 'Duration (min)')}</span>}
            unit="min"
            value={durationMinStr}
            onChange={(val) => setDurationMinStr(val)}
            min={1}
            max={300}
            clampOnBlur
            placeholder="45"
            aria-label="Exercise duration in minutes"
          />
        </div>

        <div className="sm:col-span-3 flex items-end">
          <button
            type="button"
            onClick={handleAddBurn}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-tomato-brand hover:bg-tomato-brand/90 text-white font-display font-black text-xs uppercase tracking-wider transition-transform active:scale-95 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t(`বার্ন যোগ (${estimatedBurn} kcal)`, `Add (${estimatedBurn} kcal)`)}</span>
          </button>
        </div>
      </div>

      {/* Logged Exercise List */}
      {burns.length > 0 && (
        <div className="mt-5 space-y-2 pt-4 border-t border-border/60">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
            {t('আজকের সম্পন্ন ব্যায়ামসমূহ', 'Logged Activities Today')}
          </span>
          <div className="divide-y divide-border/40 rounded-2xl bg-secondary/30 border border-border/60">
            {burns.map((b) => (
              <div
                key={b.id}
                className="p-3 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-tomato-brand shrink-0" />
                  <span className="font-bold text-foreground">
                    {locale === 'bn' ? b.nameBn : b.nameEn}
                  </span>
                  <span className="text-muted-foreground">
                    ({b.durationMinutes} {t('মিনিট', 'mins')})
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-display font-black text-sm text-tomato-brand">
                    {b.burnedKcal} kcal
                  </span>
                  <button
                    onClick={() => handleRemoveBurn(b.id)}
                    className="p-1 rounded-md text-muted-foreground hover:text-tomato-brand hover:bg-secondary transition-colors"
                    title={t('মুছুন', 'Delete')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
