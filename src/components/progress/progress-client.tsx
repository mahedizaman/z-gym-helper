'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useLanguage } from '@/lib/language-context';
import {
  Scale,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  ArrowRight,
  Info,
  Share2,
} from 'lucide-react';
import { ProgressShareModal } from '@/components/progress/progress-share-modal';
import { NumberField } from '@/components/ui/number-field';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface WeightLog {
  _id: string;
  date: string;
  weightKg: number;
  note?: string;
}

export function ProgressClient() {
  const { t } = useLanguage();
  const { status } = useSession();

  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [startWeight, setStartWeight] = useState<number | null>(null);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [monthChange, setMonthChange] = useState<number>(0);
  const [totalChange, setTotalChange] = useState<number>(0);

  // Form states
  const [weightInput, setWeightInput] = useState('');
  const [dateInput, setDateInput] = useState(() => new Date().toISOString().split('T')[0]);
  const [noteInput, setNoteInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const fetchWeightData = useCallback(async () => {
    try {
      const res = await fetch('/api/user/weight');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setLogs(json.data.logs || []);
          setStartWeight(json.data.startWeight);
          setCurrentWeight(json.data.currentWeight);
          setMonthChange(json.data.monthChange);
          setTotalChange(json.data.totalChange);
          if (json.data.currentWeight) {
            setWeightInput(String(json.data.currentWeight));
          }
        }
      }
    } catch (err) {
      console.error('Error fetching weights:', err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (status === 'authenticated') {
      fetch('/api/user/weight')
        .then((res) => res.json())
        .then((json) => {
          if (isMounted && json.success) {
            setLogs(json.data.logs || []);
            setStartWeight(json.data.startWeight);
            setCurrentWeight(json.data.currentWeight);
            setMonthChange(json.data.monthChange);
            setTotalChange(json.data.totalChange);
            if (json.data.currentWeight) {
              setWeightInput(String(json.data.currentWeight));
            }
          }
        })
        .catch((err) => console.error('Error fetching weights:', err));
    }
    return () => {
      isMounted = false;
    };
  }, [status]);

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(weightInput);
    if (!val || val < 20 || val > 350) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/user/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weightKg: val,
          date: dateInput,
          note: noteInput.trim() || undefined,
        }),
      });

      if (res.ok) {
        setNoteInput('');
        fetchWeightData();
      }
    } catch (err) {
      console.error('Error recording weight:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWeight = async (id: string) => {
    if (!confirm(t('এই ওজনের রেকর্ডটি মুছে ফেলতে চান?', 'Delete this weight record?'))) return;

    try {
      const res = await fetch(`/api/user/weight?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchWeightData();
      }
    } catch (err) {
      console.error('Error deleting weight:', err);
    }
  };

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto max-w-xl px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-3xl bg-lime-soft text-ink-base mx-auto mb-6 flex items-center justify-center border border-lime-brand/30 shadow-md">
          <Scale className="w-8 h-8 text-ink-base" />
        </div>
        <h2 className="font-display font-black text-3xl uppercase tracking-tight text-foreground mb-3">
          {t('স্থায়ী ওজন ট্র্যাকিং', 'Permanent Weight Tracking')}
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          {t(
            'মাসিক ওজন পরিবর্তনের ধারাবাহিক গ্রাফ ও ইতিহাস রেকর্ড রাখার জন্য Google দিয়ে লগইন করুন।',
            'Sign in with Google to log daily weights, monitor monthly trends, and retain permanent fitness history.'
          )}
        </p>
        <button
          onClick={() => signIn('google', { callbackUrl: '/progress' })}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-lime-brand text-ink-base font-bold text-sm hover:bg-lime-hover shadow-lg transition-all cursor-pointer"
        >
          <span>{t('Google দিয়ে সাইন ইন করুন', 'Sign In with Google')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Format data for chart
  const chartData = logs.map((l) => ({
    date: l.date.slice(5), // MM-DD
    fullDate: l.date,
    weight: l.weightKg,
  }));

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 sm:py-12 space-y-8">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime-soft text-ink-base border border-lime-brand/40 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-ink-base" />
            <span>{t('স্থায়ী রেকর্ড', 'Permanent Records')}</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-foreground">
            {t('ওজন ও অগ্রগতি ট্র্যাকিং', 'Weight & Progress History')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {t(
              'নিয়মিত সকালের খালি পেটে ওজন পরিমাপ করে আপনার দীর্ঘমেয়াদী পরিবর্তন পর্যবেক্ষণ করুন।',
              'Track long-term weight changes with weekly and monthly trend indicators.'
            )}
          </p>
        </div>

        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-lime-brand text-ink-base font-bold text-xs hover:bg-lime-hover shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Share2 className="w-4 h-4" />
          <span>{t('প্রগ্রেস কার্ড শেয়ার', 'Share Progress Card')}</span>
        </button>
      </div>

      {/* Metric Delta Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Starting Weight */}
        <div className="rounded-3xl border border-border bg-card p-5 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('শুরুর ওজন', 'Starting Weight')}
          </span>
          <div className="font-display font-black text-2xl sm:text-3xl text-foreground">
            {startWeight !== null ? `${startWeight} kg` : '—'}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {logs.length > 0 ? logs[0].date : t('এখনও লগ হয়নি', 'Not logged yet')}
          </p>
        </div>

        {/* Current Weight */}
        <div className="rounded-3xl border border-border bg-card p-5 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('বর্তমান ওজন', 'Current Weight')}
          </span>
          <div className="font-display font-black text-2xl sm:text-3xl text-lime-brand">
            {currentWeight !== null ? `${currentWeight} kg` : '—'}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {logs.length > 0 ? logs[logs.length - 1].date : t('এখনও লগ হয়নি', 'Not logged yet')}
          </p>
        </div>

        {/* This Month's Change */}
        <div className="rounded-3xl border border-border bg-card p-5 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('এই মাসের পরিবর্তন', 'This Month’s Delta')}
          </span>
          <div className="font-display font-black text-2xl sm:text-3xl flex items-center gap-2">
            <span
              className={
                monthChange < 0
                  ? 'text-lime-brand'
                  : monthChange > 0
                  ? 'text-tomato-base'
                  : 'text-foreground'
              }
            >
              {monthChange > 0 ? `+${monthChange}` : monthChange} kg
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {t('গত ৩০ দিনের পরিবর্তন', 'Last 30 days change')}
          </p>
        </div>

        {/* Total Change Since Start */}
        <div className="rounded-3xl border border-border bg-card p-5 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('মোট পরিবর্তন (জয়েনিং থেকে)', 'Total Net Delta')}
          </span>
          <div className="font-display font-black text-2xl sm:text-3xl flex items-center gap-2">
            <span
              className={
                totalChange < 0
                  ? 'text-lime-brand'
                  : totalChange > 0
                  ? 'text-tomato-base'
                  : 'text-foreground'
              }
            >
              {totalChange > 0 ? `+${totalChange}` : totalChange} kg
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {t('জয়েন করার পর থেকে মোট ব্যবধান', 'Overall net difference')}
          </p>
        </div>
      </div>

      {/* Main Grid: Weight Log Form + Progress Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Add Weight Form */}
        <div className="rounded-3xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-lime-brand text-ink-base flex items-center justify-center font-bold">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="font-display font-black text-xl text-foreground">
              {t('নতুন ওজন লগ করুন', 'Log Weight Entry')}
            </h3>
          </div>

          <form onSubmit={handleAddWeight} className="space-y-4">
            <NumberField
              id="progress-weight-input"
              label={<span className="text-xs font-semibold text-muted-foreground">{t('ওজন (কেজি)', 'Weight (kg)')} *</span>}
              unit="kg"
              allowDecimals
              step="0.1"
              min={20}
              max={350}
              required
              value={weightInput}
              onChange={(val) => setWeightInput(val)}
              placeholder="70.5"
              inputClassName="py-3 text-base font-mono rounded-2xl"
              aria-label="Weight in kilograms"
            />

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                {t('তারিখ', 'Date')} *
              </label>
              <input
                type="date"
                required
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-lime-brand"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                {t('নোট (ঐচ্ছিক)', 'Note (Optional)')}
              </label>
              <input
                type="text"
                maxLength={100}
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder={t('যেমন: সকালে খালি পেটে', 'e.g. Morning fasting')}
                className="w-full px-4 py-2.5 rounded-2xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-lime-brand"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-full bg-lime-brand hover:bg-lime-hover text-ink-base font-black text-xs uppercase tracking-wider transition-colors shadow-md disabled:opacity-50 cursor-pointer"
            >
              {submitting ? t('সংরক্ষণ হচ্ছে...', 'Saving...') : t('ওজন রেকর্ড করুন', 'Save Weight')}
            </button>
          </form>

          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground flex items-start gap-2">
            <Info className="w-4 h-4 text-lime-brand shrink-0 mt-0.5" />
            <span>
              {t(
                'ধারাবাহিক ট্র্যাকিংয়ের জন্য প্রতিদিন সকালে একই সময়ে (টয়লেট ব্যবহারের পর ও নাস্তার আগে) ওজন মাপুন।',
                'For consistent tracking, weigh yourself once daily under the same conditions (morning after restroom, before breakfast).'
              )}
            </span>
          </div>
        </div>

        {/* Right: Recharts Weight Curve Chart */}
        <div className="lg:col-span-2 rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-black text-xl uppercase tracking-tight text-foreground">
              {t('ওজন পরিবর্তনের কার্ভ', 'Weight Progress Curve')}
            </h3>
            <span className="text-xs text-muted-foreground">
              {logs.length} {t('টি রেকর্ড সংরক্ষিত', 'records logged')}
            </span>
          </div>

          {chartData.length > 1 ? (
            <div className="h-64 sm:h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#8E959D" opacity={0.15} />
                  <XAxis dataKey="date" stroke="#8E959D" fontSize={11} tickLine={false} />
                  <YAxis
                    domain={['dataMin - 1', 'dataMax + 1']}
                    stroke="#8E959D"
                    fontSize={11}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A211E',
                      borderColor: '#A9F26B',
                      borderRadius: '1rem',
                      color: '#FFFFFF',
                      fontSize: '12px',
                    }}
                    formatter={(val) => [`${val} kg`, t('ওজন', 'Weight')]}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#A9F26B"
                    strokeWidth={3}
                    dot={{ fill: '#0F1412', stroke: '#A9F26B', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#FF2E88' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 sm:h-80 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center p-6 text-muted-foreground">
              <Scale className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm font-semibold">
                {t('চার্ট দেখতে অন্তত ২টি ওজন রেকর্ড প্রয়োজন', 'Log at least 2 entries to display the visual trend chart')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Weight History Log Table */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-4">
        <h3 className="font-display font-black text-xl uppercase tracking-tight text-foreground">
          {t('সকল ওজন পরিমাপের ইতিহাস', 'Weight History Logs')}
        </h3>

        {logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground uppercase font-bold">
                  <th className="pb-3">{t('তারিখ', 'Date')}</th>
                  <th className="pb-3">{t('ওজন (কেজি)', 'Weight (kg)')}</th>
                  <th className="pb-3">{t('নোট', 'Note')}</th>
                  <th className="pb-3 text-right">{t('অ্যাকশন', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {logs
                  .slice()
                  .reverse()
                  .map((log) => (
                    <tr key={log._id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 font-medium text-foreground flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{log.date}</span>
                      </td>
                      <td className="py-3.5 font-bold font-mono text-foreground">
                        {log.weightKg} kg
                      </td>
                      <td className="py-3.5 text-muted-foreground text-xs">
                        {log.note || '—'}
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteWeight(log._id)}
                          className="p-1.5 rounded-full hover:bg-tomato-base/10 text-muted-foreground hover:text-tomato-base transition-colors cursor-pointer"
                          title={t('মুছে ফেলুন', 'Delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center text-muted-foreground text-sm">
            {t('কোনো ওজন রেকর্ড সংরক্ষিত নেই।', 'No weight records found.')}
          </div>
        )}
      </div>

      {/* Progress Share Modal */}
      <ProgressShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        nickname={status === 'authenticated' ? 'Z-Athlete' : 'Guest'}
        streak={logs.length > 0 ? 1 : 0}
        workouts={logs.length}
        monthChange={
          totalChange !== 0 ? `${totalChange > 0 ? '+' : ''}${totalChange} kg` : '0 kg'
        }
        weightKg={currentWeight}
      />
    </div>
  );
}
