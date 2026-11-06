'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { guestStorage, type GuestExerciseBurn } from '@/lib/guest-storage';
import { NumberField } from '@/components/ui/number-field';
import { Z_INDEX } from '@/config/z-index';
import { X, Flame, Plus, Dumbbell, Check } from 'lucide-react';
import { toBengaliDigits } from '@/lib/bengali-digits';

interface QuickExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  userWeightKg: number;
  onExerciseAdded: (burn: GuestExerciseBurn) => void;
}

const COMMON_ACTIVITIES = [
  { id: 'walking_brisk', nameBn: 'দ্রুত হাঁটা (ব্রিস্ক ওয়াক)', nameEn: 'Brisk Walking', met: 3.8 },
  { id: 'weightlifting', nameBn: 'জিম ওয়েট ট্রেনিং', nameEn: 'Gym Weight Training', met: 5.0 },
  { id: 'running_8kmh', nameBn: 'দৌড়ানো / জগিং (৮ কিমি/ঘণ্টা)', nameEn: 'Jogging (8 km/h)', met: 8.3 },
  { id: 'cycling_moderate', nameBn: 'সাইক্লিং (মাঝারি গতি)', nameEn: 'Cycling (Moderate)', met: 6.0 },
  { id: 'calisthenics', nameBn: 'ক্যালিস্থেনিক্স / ফ্রি-হ্যান্ড', nameEn: 'Calisthenics', met: 8.0 },
  { id: 'jump_rope', nameBn: 'দড়ি লাফ (স্কিপিং)', nameEn: 'Jump Rope', met: 10.0 },
];

export function QuickExerciseModal({
  isOpen,
  onClose,
  userWeightKg,
  onExerciseAdded,
}: QuickExerciseModalProps) {
  const { t, locale } = useLanguage();
  const isBn = locale === 'bn';

  const [selectedActivity, setSelectedActivity] = useState(COMMON_ACTIVITIES[0]);
  const [durationStr, setDurationStr] = useState<string>('30');

  if (!isOpen) return null;

  const weight = userWeightKg && userWeightKg >= 30 ? userWeightKg : 70;
  const duration = parseInt(durationStr, 10) || 0;
  const estimatedBurn = Math.round((selectedActivity.met * 3.5 * weight * duration) / 200);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (duration <= 0) return;

    const todayDate = guestStorage.getDhakaDateString();
    const newBurn = {
      nameBn: selectedActivity.nameBn,
      nameEn: selectedActivity.nameEn,
      met: selectedActivity.met,
      durationMinutes: duration,
      burnedKcal: estimatedBurn,
    };

    const updated = guestStorage.addExerciseBurn(todayDate, newBurn);
    const addedItem = updated[updated.length - 1];
    onExerciseAdded(addedItem);
    onClose();
  };

  return (
    <div
      style={{ zIndex: Z_INDEX.modal }}
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-background text-foreground border border-border rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          type="button"
          aria-label={t('বন্ধ করুন', 'Close')}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-tomato-base/15 text-tomato-base flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight">
              {t('ব্যায়াম লগ করুন', 'Log Workout')}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t('ব্যায়াম ও সময় দিয়ে পোড়ানো ক্যালোরি হিসাব করুন', 'Select activity and duration to track burn')}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-foreground block mb-2">
              {t('ব্যায়ামের ধরন', 'Exercise Activity')}
            </label>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {COMMON_ACTIVITIES.map((act) => {
                const isSelected = selectedActivity.id === act.id;
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setSelectedActivity(act)}
                    className={`w-full p-3 rounded-2xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-tomato-base bg-secondary/80 ring-2 ring-tomato-base shadow-xs'
                        : 'border-border bg-secondary/30 hover:bg-secondary/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Dumbbell className={`w-4 h-4 ${isSelected ? 'text-tomato-base' : 'text-muted-foreground'}`} />
                      <span className="font-bold text-foreground">
                        {t(act.nameBn, act.nameEn)}
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-tomato-base stroke-[3]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1.5">
              {t('সময়কাল (মিনিট)', 'Duration (Minutes)')}
            </label>
            <NumberField
              value={durationStr}
              onChange={setDurationStr}
              placeholder="30"
              unit={t('মিনিট', 'min')}
              inputMode="numeric"
              allowDecimals={false}
              min={1}
              max={360}
            />
          </div>

          {/* Burn estimation card */}
          <div className="p-3.5 rounded-2xl bg-tomato-base/10 border border-tomato-base/30 flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">
              {t('আনুমানিক পোড়ানো শক্তি:', 'Estimated Burn:')}
            </span>
            <span className="font-mono text-base font-black text-tomato-base">
              {isBn ? toBengaliDigits(estimatedBurn) : estimatedBurn} {t('ক্যালোরি', 'kcal')}
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full text-xs font-bold hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {t('বাতিল', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={duration <= 0}
              className="px-6 py-2.5 rounded-full text-xs font-bold bg-tomato-base text-white hover:bg-tomato-base/90 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>{t('যোগ করুন', 'Add Workout')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
