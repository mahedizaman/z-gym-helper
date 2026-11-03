'use client';

import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Dumbbell, AlertTriangle, X } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { ExerciseCard, ExerciseCardProps } from '@/components/exercise/exercise-card';

interface ExerciseLibraryClientProps {
  initialExercises: ExerciseCardProps[];
}

export function ExerciseLibraryClient({ initialExercises }: ExerciseLibraryClientProps) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const muscleTabs = [
    { id: 'all', bn: 'সব পেশি', en: 'All Muscles' },
    { id: 'chest', bn: 'বুক', en: 'Chest' },
    { id: 'back', bn: 'পিঠ', en: 'Back' },
    { id: 'shoulders', bn: 'কাঁধ', en: 'Shoulders' },
    { id: 'arms', bn: 'হাত', en: 'Arms' },
    { id: 'legs', bn: 'পা', en: 'Legs' },
    { id: 'core', bn: 'কোর', en: 'Core' },
  ];

  const equipmentOptions = [
    { id: 'all', bn: 'সব সরঞ্জাম', en: 'All Equipment' },
    { id: 'barbell', bn: 'বারবেল', en: 'Barbell' },
    { id: 'dumbbell', bn: 'ডাম্বেল', en: 'Dumbbell' },
    { id: 'cable', bn: 'কেবল', en: 'Cable' },
    { id: 'machine', bn: 'মেশিন', en: 'Machine' },
    { id: 'bodyweight', bn: 'বডিওয়েট', en: 'Bodyweight' },
  ];

  const levelOptions = [
    { id: 'all', bn: 'সব লেভেল', en: 'All Levels' },
    { id: 'beginner', bn: 'সহজ', en: 'Beginner' },
    { id: 'intermediate', bn: 'মধ্যম', en: 'Intermediate' },
    { id: 'advanced', bn: 'উন্নত', en: 'Advanced' },
  ];

  const filteredExercises = useMemo(() => {
    return initialExercises.filter((item) => {
      // Muscle filter
      if (selectedMuscle !== 'all' && item.muscle !== selectedMuscle) {
        return false;
      }
      // Equipment filter
      if (selectedEquipment !== 'all' && item.equipment !== selectedEquipment) {
        return false;
      }
      // Level filter
      if (selectedLevel !== 'all' && item.level !== selectedLevel) {
        return false;
      }
      // Search
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesBn = item.nameBn.toLowerCase().includes(q);
        const matchesEn = item.nameEn.toLowerCase().includes(q);
        const matchesMuscle = item.muscle.toLowerCase().includes(q);
        if (!matchesBn && !matchesEn && !matchesMuscle) return false;
      }
      return true;
    });
  }, [initialExercises, search, selectedMuscle, selectedEquipment, selectedLevel]);

  const hasActiveFilters =
    search.trim() !== '' ||
    selectedMuscle !== 'all' ||
    selectedEquipment !== 'all' ||
    selectedLevel !== 'all';

  const resetFilters = () => {
    setSearch('');
    setSelectedMuscle('all');
    setSelectedEquipment('all');
    setSelectedLevel('all');
  };

  return (
    <div className="space-y-8">
      {/* Disclaimer / Reviewing Notice Banner */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 sm:p-5 flex items-start gap-3.5">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-foreground/90 space-y-1">
          <p className="font-bold text-amber-600 dark:text-amber-400">
            {t(
              'যাচাই প্রক্রিয়াধীন নোটিশ (AI খসড়া গাইড)',
              'Reviewing Notice (AI Draft Guides)'
            )}
          </p>
          <p className="text-muted-foreground leading-relaxed">
            {t(
              'ব্যায়ামসমূহের বাংলা নির্দেশনা ও ফর্ম গাইডগুলো কৃত্রিম বুদ্ধিমত্তা দ্বারা খসড়া করা হয়েছে এবং সার্টিফায়েড ট্রেইনার দ্বারা চূড়ান্ত রিভিউ প্রক্রিয়াধীন রয়েছে। সঠিক ও নিরাপদ অঙ্গভঙ্গির জন্য জিম প্রশিক্ষকের সহায়তা নিন।',
              'Bangla instructions and form cues are currently AI-drafted and undergoing review by certified trainers. Please consult a qualified gym trainer to ensure safe biomechanics.'
            )}
          </p>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t(
              'ব্যায়ামের নাম দিয়ে খুঁজুন (যেমন: বেঞ্চ প্রেস, স্কোয়াট, কার্ল)...',
              'Search exercise by name (e.g. Bench Press, Squat, Curl)...'
            )}
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-lime-brand/50 focus:border-lime-brand transition-all shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Muscle Group Horizontal Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {muscleTabs.map((tab) => {
            const isActive = selectedMuscle === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedMuscle(tab.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-lime-brand text-ink-base shadow-md font-bold'
                    : 'bg-muted/80 text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {t(tab.bn, tab.en)}
              </button>
            );
          })}
        </div>

        {/* Equipment & Level Selectors */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground">
              {t('ফিল্টার:', 'Filters:')}
            </span>
          </div>

          {/* Equipment Dropdown */}
          <select
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value)}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-card border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-lime-brand cursor-pointer"
          >
            {equipmentOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {t(opt.bn, opt.en)}
              </option>
            ))}
          </select>

          {/* Level Dropdown */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-card border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-lime-brand cursor-pointer"
          >
            {levelOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {t(opt.bn, opt.en)}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-tomato-base hover:underline flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              {t('সব রিসেট করুন', 'Reset all')}
            </button>
          )}

          <div className="ml-auto text-xs text-muted-foreground">
            {t(
              `${filteredExercises.length}টি ব্যায়াম পাওয়া গেছে`,
              `${filteredExercises.length} exercises found`
            )}
          </div>
        </div>
      </div>

      {/* Exercise Grid */}
      {filteredExercises.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <ExerciseCard key={exercise.slug} {...exercise} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-3xl border border-dashed border-border bg-card/50">
          <Dumbbell className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-foreground mb-1">
            {t('কোনো ব্যায়াম পাওয়া যায়নি', 'No exercises found')}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4">
            {t(
              'আপনার অনুসন্ধানের সাথে মিলে এমন কোনো ফলাফল নেই। ফিল্টার পরিবর্তন করে দেখুন।',
              'Try adjusting your search keywords or clear the active filters.'
            )}
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-full bg-lime-brand text-ink-base font-bold text-xs hover:bg-lime-hover transition-colors"
          >
            {t('ফিল্টার রিসেট করুন', 'Reset Filters')}
          </button>
        </div>
      )}
    </div>
  );
}
