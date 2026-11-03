'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useLanguage } from '@/lib/language-context';
import { Trophy, Flame, TrendingDown, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  nickname: string;
  score: number;
  formattedScore: string;
  isCurrentUser?: boolean;
}

interface LeaderboardResponse {
  metric: 'streak' | 'weight_loss_pct';
  totalOptedIn: number;
  entries: LeaderboardEntry[];
  userRank?: LeaderboardEntry | null;
}

export function LeaderboardClient() {
  const { t } = useLanguage();
  const { status } = useSession();

  const [metric, setMetric] = useState<'streak' | 'weight_loss_pct'>('streak');
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [optIn, setOptIn] = useState<boolean>(false);
  const [togglingOptIn, setTogglingOptIn] = useState(false);

  // Fetch user profile to get initial opt-in state
  useEffect(() => {
    let isMounted = true;
    if (status === 'authenticated') {
      fetch('/api/user')
        .then((res) => res.json())
        .then((json) => {
          if (isMounted && json.success && json.data) {
            setOptIn(!!json.data.optInLeaderboard);
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [status]);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch(`/api/leaderboard?metric=${metric}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    }
  }, [metric]);

  // Fetch leaderboard data when metric changes
  useEffect(() => {
    let isMounted = true;
    fetch(`/api/leaderboard?metric=${metric}`)
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success) {
          setData(json.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load leaderboard:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [metric]);

  const handleToggleOptIn = async (newVal: boolean) => {
    try {
      setTogglingOptIn(true);
      const res = await fetch('/api/leaderboard/opt-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optIn: newVal }),
      });

      if (res.ok) {
        setOptIn(newVal);
        fetchLeaderboard();
      }
    } catch (err) {
      console.error('Failed to toggle opt-in:', err);
    } finally {
      setTogglingOptIn(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-soft text-thunder-base border border-thunder-base/30 text-xs font-bold uppercase tracking-wider shadow-xs">
          <Trophy className="w-3.5 h-3.5" />
          <span>{t('কমিউনিটি লিডারবোর্ড', 'Community Leaderboard')}</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-foreground">
          {t('ফিটনেস লিডারবোর্ড ও র‍্যাঙ্কিং', 'Fitness Leaderboard & Ranks')}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {t(
            '১০০% প্রাইভেসি-সুরক্ষিত ও অপ্ট-ইন ভিত্তিক র‍্যাঙ্কিং। আপনার আসল নাম বা ওজন গোপন রেখে কেবল নিকনেম ও স্ট্রিকের ভিত্তিতে র‍্যাঙ্ক নির্ধারণ করা হয়।',
            '100% privacy-safe and opt-in rankings. Ranks by active streak or weight change %, never raw kg.'
          )}
        </p>
      </div>

      {/* Metric Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-card border border-border shadow-xs">
          <button
            onClick={() => setMetric('streak')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              metric === 'streak'
                ? 'bg-thunder-base text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Flame className="w-4 h-4 fill-current" />
            <span>{t('ধারাবাহিক স্ট্রিক', 'Active Streak')}</span>
          </button>
          <button
            onClick={() => setMetric('weight_loss_pct')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              metric === 'weight_loss_pct'
                ? 'bg-lime-brand text-ink-base shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>{t('ওজন হ্রাস % (শতকরা)', 'Weight Loss %')}</span>
          </button>
        </div>
      </div>

      {/* Privacy Opt-In Notice Card */}
      {status === 'authenticated' ? (
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-lime-brand" />
              <h2 className="text-sm font-bold text-foreground">
                {t('পাবলিক লিডারবোর্ডে অন্তর্ভুক্তি', 'Public Leaderboard Participation')}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground max-w-xl">
              {t(
                'অনুমতি দিলে শুধুমাত্র আপনার নিকনেম ও স্কোর প্রদর্শিত হবে। আপনার Google নাম, ছবি, ইমেইল বা কেজি ওজন কখনো দেখানো হবে না।',
                'When enabled, only your nickname and relative score are shown. Your Google email, photo, and raw kg weight remain strictly private.'
              )}
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={optIn}
              disabled={togglingOptIn}
              onChange={(e) => handleToggleOptIn(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-brand"></div>
          </label>
        </div>
      ) : (
        <div className="rounded-3xl border border-border bg-card/60 p-6 text-center space-y-3">
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t(
              'লিডারবোর্ডে অংশ নিতে এবং নিজের স্ট্রিক যোগ করতে Google দিয়ে সাইন ইন করুন।',
              'Sign in with Google to opt into the community leaderboard and show your streak.'
            )}
          </p>
          <button
            onClick={() => signIn('google', { callbackUrl: '/leaderboard' })}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-lime-brand text-ink-base font-bold text-xs hover:bg-lime-hover shadow-sm transition-all cursor-pointer"
          >
            <span>{t('Google দিয়ে সাইন ইন করুন', 'Sign In with Google')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* User's Pinned Standing (if opted in and found) */}
      {data?.userRank && (
        <div className="rounded-2xl border-2 border-lime-brand bg-lime-soft/40 p-4 px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-lime-brand text-ink-base font-display font-black text-lg flex items-center justify-center">
              #{data.userRank.rank}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-sm">
                  {data.userRank.nickname}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-lime-brand text-ink-base">
                  {t('আপনি', 'You')}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {t('আপনার বর্তমান অবস্থান', 'Your current standing')}
              </span>
            </div>
          </div>
          <div className="font-display font-black text-xl text-foreground">
            {data.userRank.formattedScore}
          </div>
        </div>
      )}

      {/* Standings List */}
      <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="font-display font-black text-lg uppercase tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-lime-brand" />
            <span>
              {metric === 'streak'
                ? t('টপ স্ট্রিক র‍্যাঙ্কিং', 'Top Streak Standings')
                : t('টপ প্রগ্রেস র‍্যাঙ্কিং', 'Top Progress Standings')}
            </span>
          </h2>
          <span className="text-xs text-muted-foreground">
            {t(`মোট অংশগ্রহণকারী: ${data?.totalOptedIn || 0} জন`, `Total: ${data?.totalOptedIn || 0} athletes`)}
          </span>
        </div>

        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 rounded-2xl bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : data && data.entries.length > 0 ? (
          <div className="divide-y divide-border">
            {data.entries.map((entry) => {
              const isTop1 = entry.rank === 1;
              const isTop2 = entry.rank === 2;
              const isTop3 = entry.rank === 3;

              return (
                <div
                  key={entry.rank}
                  className={`p-4 px-6 flex items-center justify-between transition-colors ${
                    entry.isCurrentUser ? 'bg-lime-soft/20' : 'hover:bg-muted/30'
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
                      {isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : `#${entry.rank}`}
                    </div>

                    {/* Nickname */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm sm:text-base">
                          {entry.nickname}
                        </span>
                        {entry.isCurrentUser && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-lime-brand text-ink-base">
                            {t('আপনি', 'You')}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {t('ভেরিফাইড অ্যাথলেট', 'Verified Athlete')}
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div
                      className={`font-display font-black text-lg sm:text-xl ${
                        metric === 'streak' ? 'text-thunder-base' : 'text-lime-brand'
                      }`}
                    >
                      {entry.formattedScore}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center text-muted-foreground space-y-3">
            <Trophy className="w-10 h-10 mx-auto text-muted-foreground/40" />
            <p className="text-sm">
              {t(
                'এখনও কেউ এই ক্যাটাগরিতে লিডারবোর্ডে অংশ নেয়নি। আপনিই প্রথম যোগ দিন!',
                'No athletes opted into this category yet. Be the first to join!'
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
