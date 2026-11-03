'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { useLanguage } from '@/lib/language-context';
import {
  Trophy,
  Users,
  Copy,
  Check,
  Calendar,
  Flame,
  Dumbbell,
  TrendingDown,
  LogOut,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface Participant {
  nickname: string;
  score: number;
  joinedAt: string;
  isCurrentUser?: boolean;
}

interface ChallengeDetail {
  code: string;
  title: string;
  durationDays: number;
  metric: 'streak' | 'workouts' | 'weight_loss_pct';
  startDate: string;
  endDate: string;
  participantCount: number;
  maxParticipants: number;
  participants: Participant[];
  isActive: boolean;
  isUserParticipant: boolean;
  isUserCreator: boolean;
}

export function ChallengeDetailClient({ code }: { code: string }) {
  const { t } = useLanguage();
  const { status } = useSession();
  const router = useRouter();

  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Join state
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  // Leave state
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const fetchChallenge = useCallback(async () => {
    try {
      setError('');
      const res = await fetch(`/api/challenges/${code}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setChallenge(json.data);
          return;
        }
      }
      setError(t('চ্যালেঞ্জটি খুঁজে পাওয়া যায়নি বা সমাপ্ত হয়েছে', 'Challenge not found or ended'));
    } catch (err) {
      console.error('Failed to load challenge:', err);
      setError(t('সার্ভারের সাথে সংযোগে সমস্যা হচ্ছে', 'Failed to connect to server'));
    }
  }, [code, t]);

  useEffect(() => {
    let isMounted = true;
    fetch(`/api/challenges/${code}`)
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;
        if (json.success) {
          setChallenge(json.data);
        } else {
          setError(json.error || t('চ্যালেঞ্জটি খুঁজে পাওয়া যায়নি বা সমাপ্ত হয়েছে', 'Challenge not found or ended'));
        }
      })
      .catch(() => {
        if (isMounted) setError(t('সার্ভারের সাথে সংযোগে সমস্যা হচ্ছে', 'Failed to connect to server'));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [code, t]);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/c/${code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleJoin = async () => {
    if (status !== 'authenticated') {
      signIn('google', { callbackUrl: `/c/${code}` });
      return;
    }

    try {
      setJoining(true);
      setJoinError('');

      const res = await fetch(`/api/challenges/${code}/join`, {
        method: 'POST',
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setJoinError(json.error || 'Failed to join challenge');
        return;
      }

      fetchChallenge();
    } catch (err) {
      console.error('Join error:', err);
      setJoinError('Error joining challenge');
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    try {
      setLeaving(true);
      const res = await fetch(`/api/challenges/${code}/leave`, {
        method: 'POST',
      });
      const json = await res.json();

      if (res.ok && json.success) {
        router.push('/challenges');
      }
    } catch (err) {
      console.error('Leave error:', err);
    } finally {
      setLeaving(false);
      setShowLeaveModal(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16 space-y-6">
        <div className="h-44 rounded-3xl bg-muted/40 animate-pulse" />
        <div className="h-64 rounded-3xl bg-muted/40 animate-pulse" />
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-tomato-soft text-tomato-base mx-auto flex items-center justify-center">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="font-display font-black text-2xl uppercase tracking-tight text-foreground">
          {error || t('চ্যালেঞ্জ পাওয়া যায়নি', 'Challenge Not Found')}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {t('কোডটি পুনরায় যাচাই করুন অথবা চ্যালেঞ্জ তালিকায় ফিরে যান।', 'Please check the invite code or return to all challenges.')}
        </p>
        <Link
          href="/challenges"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-foreground text-background font-bold text-xs hover:opacity-90 transition-all"
        >
          <span>{t('চ্যালেঞ্জ তালিকায় ফিরুন', 'Back to Challenges')}</span>
        </Link>
      </div>
    );
  }

  const isFull = challenge.participantCount >= 10;
  const isJoined = challenge.isUserParticipant;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 sm:py-12 space-y-8">
      {/* Challenge Hero Header Card */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-3 py-1 rounded-xl bg-lime-soft text-ink-base border border-lime-brand/30 tracking-wider">
              #{challenge.code}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-muted text-muted-foreground flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-lime-brand" />
              <span>{challenge.participantCount}/10</span>
            </span>
          </div>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-background border border-border text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-lime-brand" />
                <span>{t('লিংক কপি হয়েছে!', 'Link Copied!')}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{t('ইনভাইট লিংক কপি', 'Copy Invite Link')}</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-2">
          <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-foreground">
            {challenge.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-lime-brand" />
              <span>{challenge.startDate} {t('থেকে', 'to')} {challenge.endDate}</span>
            </span>
            <span>•</span>
            <span className="font-bold text-foreground">
              {challenge.durationDays} {t('দিনের চ্যালেঞ্জ', 'Days Duration')}
            </span>
          </div>
        </div>

        {/* Metric Specification */}
        <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-soft text-thunder-base flex items-center justify-center">
              {challenge.metric === 'streak' ? (
                <Flame className="w-5 h-5 fill-current" />
              ) : challenge.metric === 'workouts' ? (
                <Dumbbell className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                {t('প্রতিযোগিতার ধরন', 'Scoring Metric')}
              </span>
              <span className="text-sm font-bold text-foreground">
                {challenge.metric === 'streak'
                  ? t('ধারাবাহিক স্ট্রিক (Streak Days)', 'Consecutive Streak Days')
                  : challenge.metric === 'workouts'
                  ? t('মোট ওয়ার্কআউট সংখ্যা (Sessions)', 'Total Workout Sessions')
                  : t('ওজন হ্রাস % (Weight Loss %)', 'Weight Loss Percentage')}
              </span>
            </div>
          </div>
        </div>

        {/* Join / Leave / Status Banner */}
        {!isJoined ? (
          <div className="pt-2">
            {isFull ? (
              <div className="p-3.5 rounded-2xl bg-tomato-soft/60 text-tomato-base font-semibold text-xs text-center border border-tomato-base/20">
                {t('এই চ্যালেঞ্জে সর্বোচ্চ ১০ জন সদস্য পূর্ণ হয়ে গেছে।', 'This challenge has reached the maximum 10 participants.')}
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-lime-brand text-ink-base font-bold text-sm hover:bg-lime-hover shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  <Trophy className="w-4 h-4" />
                  <span>
                    {status === 'authenticated'
                      ? joining
                        ? t('যুক্ত হচ্ছে...', 'Joining...')
                        : t('এই চ্যালেঞ্জে যোগ দিন', 'Join This Challenge')
                      : t('লগইন করে যোগ দিন', 'Sign In to Join Challenge')}
                  </span>
                </button>
                {joinError && (
                  <p className="text-xs text-tomato-base font-semibold text-center">{joinError}</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <div className="flex items-center gap-2 text-xs font-bold text-lime-brand">
              <Check className="w-4 h-4" />
              <span>{t('আপনি এই চ্যালেঞ্জে যুক্ত আছেন', 'You are a participant')}</span>
            </div>

            <button
              onClick={() => setShowLeaveModal(true)}
              className="text-xs font-semibold text-muted-foreground hover:text-tomato-base flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('চ্যালেঞ্জ ত্যাগ করুন', 'Leave Challenge')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Standings Table Card */}
      <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="font-display font-black text-lg uppercase tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-lime-brand" />
            <span>{t('লাইভ স্ট্যান্ডিংস ও স্কোর', 'Live Challenge Standings')}</span>
          </h2>
          <span className="text-xs text-muted-foreground">
            {challenge.participantCount} / {challenge.maxParticipants} {t('অংশগ্রহণকারী', 'Athletes')}
          </span>
        </div>

        <div className="divide-y divide-border">
          {challenge.participants.map((p, idx) => {
            const rank = idx + 1;
            const isTop1 = rank === 1;
            const isTop2 = rank === 2;
            const isTop3 = rank === 3;

            return (
              <div
                key={p.nickname + idx}
                className={`p-4 px-6 flex items-center justify-between transition-colors ${
                  p.isCurrentUser ? 'bg-lime-soft/20' : 'hover:bg-muted/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank Badge */}
                  <div
                    className={`w-9 h-9 rounded-xl font-display font-black text-base flex items-center justify-center shrink-0 ${
                      isTop1
                        ? 'bg-amber-400 text-ink-base shadow-sm'
                        : isTop2
                        ? 'bg-slate-300 text-ink-base'
                        : isTop3
                        ? 'bg-amber-700 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : `#${rank}`}
                  </div>

                  {/* Nickname (never real name/email) */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm sm:text-base">
                        {p.nickname}
                      </span>
                      {p.isCurrentUser && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-lime-brand text-ink-base">
                          {t('আপনি', 'You')}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {t('অংশগ্রহণকারী', 'Participant')}
                    </span>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div
                    className={`font-display font-black text-lg sm:text-xl ${
                      challenge.metric === 'streak'
                        ? 'text-thunder-base'
                        : 'text-lime-brand'
                    }`}
                  >
                    {challenge.metric === 'streak'
                      ? `${p.score} ${t('দিন', 'Days')}`
                      : challenge.metric === 'workouts'
                      ? `${p.score} ${t('সেশন', 'Sessions')}`
                      : `${p.score}%`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leave Challenge Confirmation Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-base/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4">
            <h3 className="font-display font-black text-xl text-foreground">
              {t('চ্যালেঞ্জ ত্যাগ করবেন?', 'Leave this Challenge?')}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t(
                'আপনি নিশ্চিত? চ্যালেঞ্জ ত্যাগ করলে স্ট্যান্ডিংস থেকে আপনার স্কোর মুছে ফেলা হবে।',
                'Are you sure? Leaving will remove your score and spot from this challenge group.'
              )}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {t('বাতিল', 'Cancel')}
              </button>
              <button
                type="button"
                disabled={leaving}
                onClick={handleLeave}
                className="px-5 py-2.5 rounded-full bg-tomato-base text-white font-bold text-xs hover:bg-tomato-deep transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {leaving ? t('ত্যাগ করা হচ্ছে...', 'Leaving...') : t('হ্যাঁ, ত্যাগ করুন', 'Leave')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
