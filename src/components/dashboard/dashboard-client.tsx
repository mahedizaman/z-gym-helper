'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signIn, useSession } from 'next-auth/react';
import { useLanguage } from '@/lib/language-context';
import {
  Flame,
  Utensils,
  Scale,
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Zap,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface DashboardData {
  user: {
    id: string;
    email: string;
    nickname: string;
    avatar?: string;
    role: string;
    profile: {
      gender: 'male' | 'female';
      weightKg: number;
      heightCm: number;
      age: number;
      calorieTarget?: number;
    };
  };
  targets: {
    bmr: number;
    tdee: number;
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
  };
  today: {
    date: string;
    summary: {
      totalIntakeKcal: number;
      totalProtein: number;
      totalCarbs: number;
      totalFat: number;
      exerciseBurnKcal: number;
      netBalanceKcal: number;
      workoutDone: boolean;
      mealCount: number;
    };
    meals: Array<{
      _id: string;
      slot: 'breakfast' | 'lunch' | 'snack' | 'dinner';
      foodNameBn: string;
      foodNameEn: string;
      grams: number;
      servingLabel: string;
      macros: { kcal: number; protein: number; carbs: number; fat: number };
    }>;
  };
  weeklyChartData: Array<{
    date: string;
    fullDate: string;
    intake: number;
    burn: number;
    target: number;
  }>;
  weightStats: {
    current: number;
    start: number;
    totalChange: number;
    history: Array<{ _id: string; date: string; weightKg: number }>;
  };
  streak: {
    currentStreak: number;
    longestStreak: number;
    isActiveToday: boolean;
  };
}

export function DashboardClient() {
  const { t } = useLanguage();
  const { status } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(() => status === 'loading' || status === 'authenticated');

  // Quick weight log modal
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState<string>('');
  const [submittingWeight, setSubmittingWeight] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/user/dashboard');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json.data);
          if (json.data?.user?.profile?.weightKg) {
            setNewWeight(String(json.data.user.profile.weightKg));
          }
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (status === 'authenticated') {
      fetch('/api/user/dashboard')
        .then((res) => res.json())
        .then((json) => {
          if (isMounted && json.success) {
            setData(json.data);
            if (json.data?.user?.profile?.weightKg) {
              setNewWeight(String(json.data.user.profile.weightKg));
            }
          }
        })
        .catch(() => {
          // Keep current view or default
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [status]);

  const handleQuickWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newWeight);
    if (!val || val < 20 || val > 350) return;

    try {
      setSubmittingWeight(true);
      const res = await fetch('/api/user/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weightKg: val }),
      });
      if (res.ok) {
        setShowWeightModal(false);
        fetchDashboard();
      }
    } catch (err) {
      console.error('Error logging weight:', err);
    } finally {
      setSubmittingWeight(false);
    }
  };

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto max-w-xl px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-3xl bg-lime-soft text-ink-base mx-auto mb-6 flex items-center justify-center border border-lime-brand/30 shadow-md">
          <Zap className="w-8 h-8 text-ink-base" />
        </div>
        <h2 className="font-display font-black text-3xl uppercase tracking-tight text-foreground mb-3">
          {t('আপনার পারসোনাল ড্যাশবোর্ড', 'Your Personal Fitness Dashboard')}
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          {t(
            'ক্লাউড ক্যালোরি ট্র্যাকিং, স্থায়ী ওজন ইতিহাস ও ডেইলি স্ট্রিক দেখতে আপনার Google অ্যাকাউন্ট দিয়ে প্রবেশ করুন।',
            'Sign in with Google to view live cloud metrics, permanent weight records, and training splits.'
          )}
        </p>
        <button
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-lime-brand text-ink-base font-bold text-sm hover:bg-lime-hover shadow-lg transition-all cursor-pointer"
        >
          <span>{t('Google দিয়ে সাইন ইন করুন', 'Sign In with Google')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-16">
        <div className="animate-pulse space-y-8">
          <div className="h-20 bg-card rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="h-32 bg-card rounded-3xl" />
            <div className="h-32 bg-card rounded-3xl" />
            <div className="h-32 bg-card rounded-3xl" />
            <div className="h-32 bg-card rounded-3xl" />
          </div>
          <div className="h-80 bg-card rounded-3xl" />
        </div>
      </div>
    );
  }

  const { user, targets, today, weeklyChartData, weightStats, streak } = data;
  const consumed = today.summary.totalIntakeKcal || 0;
  const targetKcal = targets.calories || 2000;
  const remainingKcal = Math.max(0, targetKcal - consumed);
  const burnedKcal = today.summary.exerciseBurnKcal || 0;
  const caloriePercent = Math.min(100, Math.round((consumed / targetKcal) * 100));

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:py-12 space-y-8">
      {/* Header Greeting Banner */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          {user.avatar ? (
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-lime-brand shrink-0">
              <Image src={user.avatar} alt={user.nickname} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-lime-brand text-ink-base font-display font-black text-2xl flex items-center justify-center shrink-0">
              {user.nickname.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-foreground">
                {t(`স্বাগতম, ${user.nickname}!`, `Welcome back, ${user.nickname}!`)}
              </h1>
              {user.role === 'admin' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-thunder-base text-white">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <Calendar className="w-3.5 h-3.5 text-lime-brand" />
              <span>{t('আজকের তারিখ (ঢাকা সময়):', 'Today (Dhaka Time):')}</span>
              <span className="font-semibold text-foreground">{today.date}</span>
            </p>
          </div>
        </div>

        {/* Current Streak Badge */}
        <div className="flex items-center gap-3 bg-muted/50 p-3 px-5 rounded-2xl border border-border">
          <div className="w-10 h-10 rounded-xl bg-thunder-soft text-thunder-base flex items-center justify-center font-bold">
            <Flame className="w-6 h-6 fill-current text-thunder-base" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {t('ফিটনেস স্ট্রিক', 'Current Streak')}
            </div>
            <div className="font-display font-black text-xl text-foreground">
              {t(`${streak.currentStreak} দিন একটিভ`, `${streak.currentStreak} Days Active`)}
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Row: Calories, Burn, Weight, Split */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* 1. Calories Intake */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('ক্যালোরি গ্রহণ', 'Calories Consumed')}
            </span>
            <Utensils className="w-4 h-4 text-lime-brand" />
          </div>
          <div>
            <div className="font-display font-black text-3xl text-foreground">
              {consumed} <span className="text-xs text-muted-foreground font-normal">/ {targetKcal} kcal</span>
            </div>
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden mt-3">
              <div
                className="bg-lime-brand h-full transition-all duration-500"
                style={{ width: `${caloriePercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-muted-foreground mt-2">
              <span>{caloriePercent}% {t('পূরণ', 'reached')}</span>
              <span>{remainingKcal} kcal {t('বাকি', 'left')}</span>
            </div>
          </div>
        </div>

        {/* 2. Exercise Burn */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('ব্যায়ামে বার্ন', 'Burned via Exercise')}
            </span>
            <Flame className="w-4 h-4 text-tomato-base" />
          </div>
          <div>
            <div className="font-display font-black text-3xl text-tomato-base">
              {burnedKcal} <span className="text-xs text-muted-foreground font-normal">kcal</span>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {today.summary.workoutDone
                ? t('✓ আজকের ওয়ার্কআউট সম্পন্ন হয়েছে', '✓ Workout logged today')
                : t('আজকে এখনও ওয়ার্কআউট লগ করা হয়নি', 'No workout logged yet today')}
            </p>
          </div>
        </div>

        {/* 3. Weight Tracking */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('বর্তমান ওজন', 'Current Weight')}
            </span>
            <Scale className="w-4 h-4 text-lime-brand" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <div className="font-display font-black text-3xl text-foreground">
                {weightStats.current} <span className="text-xs text-muted-foreground font-normal">kg</span>
              </div>
              <button
                onClick={() => setShowWeightModal(true)}
                className="p-1.5 rounded-full bg-lime-soft hover:bg-lime-brand text-ink-base transition-colors"
                title={t('ওজন আপডেট করুন', 'Update weight')}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold mt-3 text-muted-foreground">
              {weightStats.totalChange !== 0 ? (
                <>
                  {weightStats.totalChange > 0 ? (
                    <TrendingUp className="w-3.5 h-3.5 text-tomato-base" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-lime-brand" />
                  )}
                  <span>
                    {weightStats.totalChange > 0 ? `+${weightStats.totalChange}` : weightStats.totalChange} kg {t('পরিবর্তন', 'net change')}
                  </span>
                </>
              ) : (
                <span>{t('শুরুর ওজন অপরিবর্তিত', 'Stable since start')}</span>
              )}
            </div>
          </div>
        </div>

        {/* 4. Active Plan Shortcut */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('ওয়ার্কআউট প্ল্যান', 'Workout Plan')}
            </span>
            <Layers className="w-4 h-4 text-lime-brand" />
          </div>
          <div>
            <div className="font-display font-black text-xl text-foreground truncate">
              {t('সায়েন্টিফিক স্প্লিট', 'Scientific Split')}
            </div>
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
              {t('৩-৬ দিনের রুটিন, সেটস ও রেস্ট টাইমার লাইব্রেরি।', '3-6 day split routines with interactive rest timers.')}
            </p>
            <Link
              href="/plans"
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-lime-brand hover:underline"
            >
              <span>{t('প্ল্যান দেখুন', 'Open Plans')}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 7-Day Net Calorie & Burn Weekly Chart */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-display font-black text-xl uppercase tracking-tight text-foreground">
              {t('গত ৭ দিনের ক্যালোরি ট্রেন্ড', '7-Day Caloric Trend')}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t('দৈনিক খাদ্য গ্রহণ বনাম দৈনিক টার্গেট ও ব্যায়াম বার্ন', 'Daily calorie intake vs target and exercise burn')}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-lime-brand inline-block" />
              <span>{t('গ্রহণ (Intake)', 'Intake')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-tomato-base inline-block" />
              <span>{t('বার্ন (Burn)', 'Burn')}</span>
            </div>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#8E959D" opacity={0.15} />
              <XAxis dataKey="date" stroke="#8E959D" fontSize={11} tickLine={false} />
              <YAxis stroke="#8E959D" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A211E',
                  borderColor: '#A9F26B',
                  borderRadius: '1rem',
                  color: '#FFFFFF',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="intake" fill="#A9F26B" radius={[6, 6, 0, 0]} name={t('খাদ্য ক্যালোরি', 'Intake kcal')} />
              <Bar dataKey="burn" fill="#FF6347" radius={[6, 6, 0, 0]} name={t('ব্যায়াম বার্ন', 'Burn kcal')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/log"
          className="p-5 rounded-3xl border border-border bg-card hover:border-lime-brand/50 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-lime-soft text-ink-base flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display font-black text-lg text-foreground group-hover:text-lime-brand transition-colors">
                {t('খাবার লগ করুন', 'Log Meal')}
              </div>
              <p className="text-xs text-muted-foreground">{t('আজকের মিল যোগ করুন', 'Add food items')}</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/progress"
          className="p-5 rounded-3xl border border-border bg-card hover:border-lime-brand/50 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-lime-soft text-ink-base flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display font-black text-lg text-foreground group-hover:text-lime-brand transition-colors">
                {t('ওজন ইতিহাস ও গ্রাফ', 'Weight Tracker')}
              </div>
              <p className="text-xs text-muted-foreground">{t('সম্পূর্ণ চার্ট ও লগ', 'Full history & charts')}</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/settings"
          className="p-5 rounded-3xl border border-border bg-card hover:border-lime-brand/50 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-lime-soft text-ink-base flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display font-black text-lg text-foreground group-hover:text-lime-brand transition-colors">
                {t('প্রোফাইল ও সেটিংস', 'Settings')}
              </div>
              <p className="text-xs text-muted-foreground">{t('টার্গেট ক্যালোরি ও গোল', 'Goal & account settings')}</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Quick Weight Entry Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-display font-black text-xl text-foreground">
              {t('আজকের ওজন রেকর্ড করুন', 'Record Today’s Weight')}
            </h3>
            <form onSubmit={handleQuickWeightSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                  {t('ওজন (কেজি)', 'Weight (kg)')}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="350"
                  required
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-foreground font-mono text-lg focus:outline-none focus:ring-2 focus:ring-lime-brand"
                  placeholder="e.g. 70.5"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWeightModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {t('বাতিল', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submittingWeight}
                  className="px-5 py-2.5 rounded-full bg-lime-brand text-ink-base font-bold text-xs hover:bg-lime-hover transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {submittingWeight ? t('সেভ হচ্ছে...', 'Saving...') : t('সংরক্ষণ করুন', 'Save Weight')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
