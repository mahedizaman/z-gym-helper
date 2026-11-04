'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { useLanguage } from '@/lib/language-context';
import {
  Trophy,
  Users,
  Plus,
  ArrowRight,
  Flame,
  TrendingDown,
  Dumbbell,
  Calendar,
  Sparkles,
  X,
} from 'lucide-react';
import { Z_INDEX } from '@/config/z-index';

interface ChallengeItem {
  code: string;
  title: string;
  durationDays: number;
  metric: 'streak' | 'workouts' | 'weight_loss_pct';
  startDate: string;
  endDate: string;
  participantCount: number;
  maxParticipants: number;
  isUserParticipant: boolean;
  isUserCreator: boolean;
}

export function ChallengesClient() {
  const { t } = useLanguage();
  const { status } = useSession();
  const router = useRouter();

  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Join by code state
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  // Create challenge modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [durationDays, setDurationDays] = useState<7 | 14 | 30>(14);
  const [metric, setMetric] = useState<'streak' | 'workouts' | 'weight_loss_pct'>('streak');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    let isMounted = true;
    if (status === 'authenticated') {
      fetch('/api/challenges')
        .then((res) => res.json())
        .then((json) => {
          if (isMounted && json.success) {
            setChallenges(json.data || []);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [status]);

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = joinCode.trim().toUpperCase();
    if (!cleanCode) return;

    try {
      setJoining(true);
      setJoinError('');

      const res = await fetch(`/api/challenges/${cleanCode}/join`, {
        method: 'POST',
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setJoinError(json.error || t('কোডটি খুঁজে পাওয়া যায়নি বা মেয়াদোত্তীর্ণ', 'Invalid or expired challenge code'));
        return;
      }

      router.push(`/c/${cleanCode}`);
    } catch (err) {
      console.error('Failed to join:', err);
      setJoinError('Error joining challenge');
    } finally {
      setJoining(false);
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.length < 3) return;

    try {
      setCreating(true);
      setCreateError('');

      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          durationDays,
          metric,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setCreateError(json.error || 'Failed to create challenge');
        return;
      }

      router.push(`/c/${json.data.code}`);
    } catch (err) {
      console.error('Failed to create challenge:', err);
      setCreateError('Error creating challenge');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-12 space-y-8">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-soft text-ink-base dark:bg-[#2A111E] dark:text-pink-soft border border-thunder-base/40 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
            <Trophy className="w-3.5 h-3.5 text-thunder-base dark:text-pink-soft" />
            <span>{t('গ্রুপ ও ফ্রেন্ডস চ্যালেঞ্জ', 'Group & Friend Challenges')}</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-foreground">
            {t('ফ্রেন্ডস চ্যালেঞ্জ গ্রুপ', 'Friend Challenge Groups')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {t(
              '২ থেকে ১০ জন বন্ধুর সাথে প্রাইভেট কোড দিয়ে ৭, ১৪ বা ৩০ দিনের ফিটনেস চ্যালেঞ্জ শুরু করুন।',
              'Create private challenges with 2-10 friends via invite code /c/[code].'
            )}
          </p>
        </div>

        {status === 'authenticated' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-lime-brand text-ink-base font-bold text-xs sm:text-sm hover:bg-lime-hover shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t('নতুন চ্যালেঞ্জ তৈরি করুন', 'Create Challenge')}</span>
          </button>
        )}
      </div>

      {/* Guest Notice or Join By Code Card */}
      {status === 'unauthenticated' ? (
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-lime-soft text-ink-base mx-auto flex items-center justify-center">
            <Users className="w-6 h-6 text-ink-base" />
          </div>
          <h2 className="font-display font-black text-2xl uppercase tracking-tight text-foreground">
            {t('বন্ধুদের সাথে চ্যালেঞ্জে যোগ দিন', 'Join Group Challenges with Friends')}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            {t(
              'চ্যালেঞ্জ গ্রুপ তৈরি করতে বা ইনভাইট কোড দিয়ে যুক্ত হতে Google অ্যাকাউন্ট দিয়ে লগইন করুন।',
              'Sign in with Google to create private friend challenges or join via invite link.'
            )}
          </p>
          <button
            onClick={() => signIn('google', { callbackUrl: '/challenges' })}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-lime-brand text-ink-base font-bold text-xs hover:bg-lime-hover shadow-md transition-all cursor-pointer"
          >
            <span>{t('Google দিয়ে সাইন ইন করুন', 'Sign In with Google')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm">
          <form
            onSubmit={handleJoinByCode}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={t('ইনভাইট কোড লিখুন (যেমন: 7K9X2B4P)', 'Enter invite code (e.g. 7K9X2B4P)')}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={12}
                className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-foreground font-mono text-sm tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-lime-brand"
              />
            </div>
            <button
              type="submit"
              disabled={joining || !joinCode.trim()}
              className="px-6 py-3 rounded-2xl bg-foreground text-background font-bold text-xs sm:text-sm hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              {joining ? t('যাচাই হচ্ছে...', 'Verifying...') : t('কোড দিয়ে যোগ দিন', 'Join Challenge')}
            </button>
          </form>
          {joinError && (
            <p className="text-xs text-tomato-base font-semibold mt-2.5">{joinError}</p>
          )}
        </div>
      )}

      {/* User's Active Challenges List */}
      {status === 'authenticated' && (
        <div className="space-y-4">
          <h2 className="font-display font-black text-xl uppercase tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-lime-brand" />
            <span>{t('আপনার চলমান চ্যালেঞ্জসমূহ', 'Your Active Challenges')}</span>
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-44 rounded-3xl bg-muted/50 animate-pulse" />
              ))}
            </div>
          ) : challenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.map((c) => (
                <Link
                  key={c.code}
                  href={`/c/${c.code}`}
                  className="rounded-3xl border border-border bg-card p-6 shadow-sm hover:border-lime-brand transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-muted text-foreground tracking-wider">
                        #{c.code}
                      </span>
                      <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-lime-brand" />
                        <span>{c.participantCount}/10</span>
                      </span>
                    </div>

                    <h3 className="font-display font-black text-2xl uppercase tracking-tight text-foreground group-hover:text-lime-brand transition-colors">
                      {c.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-pink-soft text-ink-base dark:bg-[#2A111E] dark:text-pink-soft border border-thunder-base/30 font-bold flex items-center gap-1">
                        {c.metric === 'streak' ? (
                          <>
                            <Flame className="w-3.5 h-3.5 fill-current" />
                            <span>{t('স্ট্রিক লক্ষ্যমাত্রা', 'Streak Metric')}</span>
                          </>
                        ) : c.metric === 'workouts' ? (
                          <>
                            <Dumbbell className="w-3.5 h-3.5" />
                            <span>{t('ওয়ার্কআউট সংখ্যা', 'Workouts Metric')}</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-3.5 h-3.5" />
                            <span>{t('ওজন হ্রাস %', 'Weight Loss %')}</span>
                          </>
                        )}
                      </span>

                      <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-semibold flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{c.durationDays} {t('দিন', 'Days')}</span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between text-xs font-bold text-lime-brand">
                    <span>{t('স্ট্যান্ডিংস ও বিস্তারিত', 'View Standings')}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground space-y-3">
              <Trophy className="w-10 h-10 mx-auto text-muted-foreground/40" />
              <p className="text-sm">
                {t(
                  'আপনি এখনও কোনো চ্যালেঞ্জে অংশ নেননি। নতুন চ্যালেঞ্জ তৈরি করুন অথবা কোড দিয়ে যোগ দিন।',
                  'You have not joined any challenges yet. Create a challenge or join with an invite code.'
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{ zIndex: Z_INDEX.modal }}
          className="fixed inset-0 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-md rounded-3xl bg-card text-card-foreground border-2 border-border p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-thunder-base" />
                <h3 className="font-display font-black text-xl uppercase tracking-tight text-foreground">
                  {t('নতুন ফ্রেন্ডস চ্যালেঞ্জ', 'Create Friend Challenge')}
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                  {t('চ্যালেঞ্জের নাম', 'Challenge Title')} *
                </label>
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={50}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('যেমন: ধানমন্ডি ফিটনেস মিশন', 'e.g. Dhanmondi Fitness Mission')}
                  className="w-full px-4 py-2.5 rounded-2xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-lime-brand"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                  {t('মেয়াদ (দিন)', 'Duration (Days)')} *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[7, 14, 30].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDurationDays(d as 7 | 14 | 30)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        durationDays === d
                          ? 'bg-lime-brand text-ink-base border-lime-brand shadow-xs'
                          : 'bg-background border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {d} {t('দিন', 'Days')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                  {t('প্রতিযোগিতার মাপকাঠি (Metric)', 'Scoring Metric')} *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background cursor-pointer hover:border-lime-brand/60 transition-colors">
                    <input
                      type="radio"
                      name="metric"
                      value="streak"
                      checked={metric === 'streak'}
                      onChange={() => setMetric('streak')}
                      className="accent-lime-brand"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-foreground block">
                        {t('ধারাবাহিক স্ট্রিক (Streak)', 'Daily Streak')}
                      </span>
                      <span className="text-muted-foreground">
                        {t('কে কত দিন না থেমে ব্যায়াম বা খাবার লগ করেছে', 'Rank by consecutive active days')}
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background cursor-pointer hover:border-lime-brand/60 transition-colors">
                    <input
                      type="radio"
                      name="metric"
                      value="workouts"
                      checked={metric === 'workouts'}
                      onChange={() => setMetric('workouts')}
                      className="accent-lime-brand"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-foreground block">
                        {t('মোট ওয়ার্কআউট সংখ্যা', 'Completed Workouts')}
                      </span>
                      <span className="text-muted-foreground">
                        {t('কতটি ওয়ার্কআউট সেশন সম্পন্ন করা হয়েছে', 'Rank by total workout sessions')}
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background cursor-pointer hover:border-lime-brand/60 transition-colors">
                    <input
                      type="radio"
                      name="metric"
                      value="weight_loss_pct"
                      checked={metric === 'weight_loss_pct'}
                      onChange={() => setMetric('weight_loss_pct')}
                      className="accent-lime-brand"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-foreground block">
                        {t('ওজন হ্রাস % (শতকরা হার)', 'Weight Loss %')}
                      </span>
                      <span className="text-muted-foreground">
                        {t('ওজন পরিবর্তনের শতকরা হার (আসল কেজি গোপন রাখা হয়)', 'Rank by percentage change (raw kg remains private)')}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {createError && (
                <p className="text-xs text-tomato-base font-semibold">{createError}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {t('বাতিল', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={creating || !title.trim()}
                  className="px-6 py-2.5 rounded-full bg-lime-brand text-ink-base font-bold text-xs hover:bg-lime-hover shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {creating ? t('তৈরি হচ্ছে...', 'Creating...') : t('চ্যালেঞ্জ শুরু করুন', 'Start Challenge')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
