'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Activity,
  TrendingUp,
  Megaphone,
  Utensils,
  Dumbbell,
  Shield,
  Search,
  CheckCircle2,
  Send,
  Plus,
  Edit2,
  Lock,
  ExternalLink,
  RefreshCw,
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
import { NumberField } from '@/components/ui/number-field';
import { useLanguage } from '@/lib/language-context';
import type { AdminMetrics } from '@/server/services/admin.service';

interface AdminUser {
  _id: string;
  nickname: string;
  email: string;
  role: string;
  disabled?: boolean;
  createdAt: string;
  lastActiveAt: string;
}

interface AdminAnnouncement {
  _id: string;
  title: string;
  titleBn: string;
  content: string;
  contentBn: string;
  type: 'info' | 'update' | 'warning' | 'celebration';
  createdAt: string;
}

interface AdminFood {
  _id: string;
  nameBn: string;
  nameEn: string;
  category: string;
  source: string;
  verified: boolean;
  per100g: {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  };
}

interface AdminExercise {
  _id: string;
  slug: string;
  nameBn: string;
  nameEn: string;
  muscle: string;
  equipment: string;
  level: string;
  youtubeId?: string;
  reviewed: boolean;
}

interface AdminAuditLog {
  _id: string;
  adminEmail: string;
  action: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ip?: string;
  createdAt: string;
}

export function AdminDashboardClient({ adminEmail }: { adminEmail: string }) {
  const { locale } = useLanguage();
  const isBn = locale === 'bn';

  const [activeTab, setActiveTab] = useState<
    'overview' | 'announcements' | 'foods' | 'exercises' | 'users' | 'audit'
  >('overview');

  // Overview Data
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);

  // Users Tab Data
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [totalUserPages, setTotalUserPages] = useState(1);
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  // Announcements Tab Data
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    titleBn: '',
    content: '',
    contentBn: '',
    type: 'info' as 'info' | 'update' | 'warning' | 'celebration',
  });
  const [showConfirmSendModal, setShowConfirmSendModal] = useState(false);
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);
  const [announcementFeedback, setAnnouncementFeedback] = useState<string | null>(null);

  // Foods Tab Data
  const [foods, setFoods] = useState<AdminFood[]>([]);
  const [editingFood, setEditingFood] = useState<Partial<AdminFood> | null>(null);
  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [foodError, setFoodError] = useState<string | null>(null);

  // Exercises Tab Data
  const [exercises, setExercises] = useState<AdminExercise[]>([]);
  const [editingExercise, setEditingExercise] = useState<Partial<AdminExercise> | null>(null);
  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [exerciseError, setExerciseError] = useState<string | null>(null);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);

  // 1. Fetch Metrics
  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/metrics');
      if (res.ok) {
        const json = await res.json();
        setMetrics(json.data);
      }
    } catch {
      // Graceful
    }
  }, []);

  // 2. Fetch Users
  const fetchUsers = useCallback(async (searchQuery = '', pageNum = 1) => {
    try {
      const query = new URLSearchParams({ page: String(pageNum), limit: '15' });
      if (searchQuery) query.set('search', searchQuery);
      const res = await fetch(`/api/admin/users?${query.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setUsers(json.data.users);
        setTotalUserPages(json.data.totalPages);
        setUserPage(json.data.page);
      }
    } catch {
      // Graceful
    }
  }, []);

  // 3. Fetch Announcements
  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/announcements');
      if (res.ok) {
        const json = await res.json();
        setAnnouncements(json.data || []);
      }
    } catch {
      // Graceful
    }
  }, []);

  // 4. Fetch Foods
  const fetchFoods = useCallback(async () => {
    try {
      const res = await fetch('/api/foods?limit=100');
      if (res.ok) {
        const json = await res.json();
        setFoods(json.data || []);
      }
    } catch {
      // Graceful
    }
  }, []);

  // 5. Fetch Exercises
  const fetchExercises = useCallback(async () => {
    try {
      const res = await fetch('/api/exercises');
      if (res.ok) {
        const json = await res.json();
        setExercises(json.data || []);
      }
    } catch {
      // Graceful
    }
  }, []);

  // 6. Fetch Audit Logs
  const fetchAuditLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/audit-logs');
      if (res.ok) {
        const json = await res.json();
        setAuditLogs(json.data || []);
      }
    } catch {
      // Graceful
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/admin/metrics')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (isMounted && json?.data) setMetrics(json.data);
      })
      .catch(() => {});

    fetch('/api/admin/users?page=1&limit=15')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (isMounted && json?.data) {
          setUsers(json.data.users);
          setTotalUserPages(json.data.totalPages);
          setUserPage(json.data.page);
        }
      })
      .catch(() => {});

    fetch('/api/admin/announcements')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (isMounted && json?.data) setAnnouncements(json.data);
      })
      .catch(() => {});

    fetch('/api/foods?limit=100')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (isMounted && json?.data) setFoods(json.data);
      })
      .catch(() => {});

    fetch('/api/exercises')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (isMounted && json?.data) setExercises(json.data);
      })
      .catch(() => {});

    fetch('/api/admin/audit-logs')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (isMounted && json?.data) setAuditLogs(json.data);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle User Disable / Enable Toggle
  const handleToggleDisable = async (targetUser: AdminUser) => {
    setActionUserId(targetUser._id);
    const newDisabledState = !targetUser.disabled;
    try {
      const res = await fetch(`/api/admin/users/${targetUser._id}/disable`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disabled: newDisabledState }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u._id === targetUser._id ? { ...u, disabled: newDisabledState } : u))
        );
        fetchMetrics();
        fetchAuditLogs();
      } else {
        const errJson = await res.json();
        alert(errJson.error || 'Action failed');
      }
    } catch {
      alert('Error updating user status');
    } finally {
      setActionUserId(null);
    }
  };

  // Handle Send Announcement
  const handleSendAnnouncement = async () => {
    setSendingAnnouncement(true);
    setAnnouncementFeedback(null);
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcementForm),
      });

      if (res.ok) {
        setShowConfirmSendModal(false);
        setAnnouncementForm({
          title: '',
          titleBn: '',
          content: '',
          contentBn: '',
          type: 'info',
        });
        setAnnouncementFeedback('Announcement dispatched successfully to all devices!');
        fetchAnnouncements();
        fetchAuditLogs();
      } else {
        const json = await res.json();
        alert(json.error || 'Failed to dispatch announcement');
      }
    } catch {
      alert('Network error while dispatching announcement');
    } finally {
      setSendingAnnouncement(false);
    }
  };

  // Handle Save Food
  const handleSaveFood = async (e: React.FormEvent) => {
    e.preventDefault();
    setFoodError(null);

    if (editingFood?.verified && (!editingFood.source || !editingFood.source.trim())) {
      setFoodError('Source citation is strictly mandatory when marking a food item as verified');
      return;
    }

    try {
      const isEdit = !!editingFood?._id;
      const url = isEdit ? `/api/admin/foods/${editingFood?._id}` : '/api/admin/foods';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameBn: editingFood?.nameBn || '',
          nameEn: editingFood?.nameEn || '',
          category: editingFood?.category || 'grains',
          source: editingFood?.source || '',
          verified: Boolean(editingFood?.verified),
          per100g: {
            kcal: Number(editingFood?.per100g?.kcal) || 0,
            protein: Number(editingFood?.per100g?.protein) || 0,
            carbs: Number(editingFood?.per100g?.carbs) || 0,
            fat: Number(editingFood?.per100g?.fat) || 0,
            fiber: Number(editingFood?.per100g?.fiber) || 0,
          },
          servings: [
            {
              labelBn: '১ বাটি',
              labelEn: '1 bowl',
              grams: 150,
            },
          ],
        }),
      });

      if (res.ok) {
        setFoodModalOpen(false);
        setEditingFood(null);
        fetchFoods();
        fetchAuditLogs();
      } else {
        const json = await res.json();
        setFoodError(json.error || 'Failed to save food');
      }
    } catch {
      setFoodError('Network error saving food');
    }
  };

  // Handle Save Exercise
  const handleSaveExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    setExerciseError(null);

    const youtubeId = editingExercise?.youtubeId?.trim() || '';
    if (youtubeId && !/^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) {
      setExerciseError('YouTube ID must be an 11-character code or left completely blank');
      return;
    }

    try {
      const isEdit = !!editingExercise?._id;
      const url = isEdit ? `/api/admin/exercises/${editingExercise?._id}` : '/api/admin/exercises';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: editingExercise?.slug || editingExercise?.nameEn?.toLowerCase().replace(/\s+/g, '-') || 'exercise',
          nameBn: editingExercise?.nameBn || '',
          nameEn: editingExercise?.nameEn || '',
          muscle: editingExercise?.muscle || 'chest',
          equipment: editingExercise?.equipment || 'bodyweight',
          level: editingExercise?.level || 'beginner',
          youtubeId,
          reviewed: Boolean(editingExercise?.reviewed),
        }),
      });

      if (res.ok) {
        setExerciseModalOpen(false);
        setEditingExercise(null);
        fetchExercises();
        fetchAuditLogs();
      } else {
        const json = await res.json();
        setExerciseError(json.error || 'Failed to save exercise');
      }
    } catch {
      setExerciseError('Network error saving exercise');
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-6 md:py-10 space-y-8">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-ink-surface border border-lime-brand/30 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-lime-brand text-xs font-bold uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>{isBn ? 'অ্যাডমিন কনসোল' : 'Administration Console'}</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-wide">
            Z-GYM HELPER MANAGEMENT
          </h1>
          <p className="text-xs text-silver-300">
            {isBn ? 'লগইন অ্যাকাউন্ট:' : 'Logged in as:'}{' '}
            <span className="font-mono text-lime-brand">{adminEmail}</span>
          </p>
        </div>

        <button
          onClick={() => {
            fetchMetrics();
            fetchAuditLogs();
          }}
          className="inline-flex items-center gap-2 self-start md:self-auto px-4 py-2 rounded-xl bg-ink-base border border-white/10 hover:border-lime-brand/40 text-xs font-bold text-silver-100 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{isBn ? 'রিফ্রেশ' : 'Refresh Data'}</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-border">
        {[
          { id: 'overview', labelBn: 'ওভারভিউ ও অ্যানালিটিক্স', labelEn: 'Overview & Analytics', icon: Activity },
          { id: 'announcements', labelBn: 'ঘোষণা ও ব্রডকাস্ট', labelEn: 'Announcements', icon: Megaphone },
          { id: 'users', labelBn: 'ইউজার ম্যানেজমেন্ট', labelEn: 'Users & Access', icon: Users },
          { id: 'foods', labelBn: 'খাদ্য তালিকা', labelEn: 'Food Items', icon: Utensils },
          { id: 'exercises', labelBn: 'ব্যায়াম লাইব্রেরি', labelEn: 'Exercises', icon: Dumbbell },
          { id: 'audit', labelBn: 'অডিট লগ', labelEn: 'Audit Trail', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-lime-brand text-ink-base shadow-sm'
                  : 'bg-secondary/60 hover:bg-secondary text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{isBn ? tab.labelBn : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Users */}
            <div className="p-6 rounded-3xl bg-card border border-border space-y-2 shadow-xs">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {isBn ? 'সর্বমোট ইউজার' : 'Total Registered Users'}
              </span>
              <div className="text-3xl font-black font-display text-foreground">
                {metrics?.totalUsers ?? '...'}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {isBn ? 'প্ল্যাটফর্মে নিবন্ধিত মোট সদস্য' : 'Total accounts registered in MongoDB'}
              </p>
            </div>

            {/* Active Users in Last 7 Days (e.g. '37/100' with Progress Bar) */}
            <div className="p-6 rounded-3xl bg-card border border-border space-y-2 shadow-xs">
              <span className="text-xs font-bold text-lime-brand uppercase tracking-wider">
                {isBn ? 'গত ৭ দিনে সক্রিয় (Active 7d)' : 'Active Users (7 Days)'}
              </span>
              <div className="text-3xl font-black font-display text-foreground">
                {metrics?.activeRatioString ?? '...'}
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-lime-brand h-full rounded-full transition-all duration-500"
                  style={{ width: `${metrics?.activePercentage ?? 0}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {metrics?.activePercentage ?? 0}% {isBn ? 'সদস্য সম্প্রতি সক্রিয়' : 'of community actively training'}
              </p>
            </div>

            {/* DAU / WAU / MAU */}
            <div className="p-6 rounded-3xl bg-card border border-border space-y-2 shadow-xs">
              <span className="text-xs font-bold text-pink-brand uppercase tracking-wider">
                DAU / WAU / MAU
              </span>
              <div className="text-2xl font-black font-display text-foreground">
                {metrics?.dau ?? 0} / {metrics?.wau ?? 0} / {metrics?.mau ?? 0}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {isBn ? 'দৈনিক / সাপ্তাহিক / মাসিক অ্যাক্টিভ' : 'Daily / Weekly / Monthly active metrics'}
              </p>
            </div>

            {/* Signups Today */}
            <div className="p-6 rounded-3xl bg-card border border-border space-y-2 shadow-xs">
              <span className="text-xs font-bold text-tomato-base uppercase tracking-wider">
                {isBn ? 'আজকের নতুন সাইনআপ' : 'New Signups Today'}
              </span>
              <div className="text-3xl font-black font-display text-foreground">
                +{metrics?.signupsToday ?? 0}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {isBn ? 'আজ মধ্যরাত থেকে নতুন অ্যাথলিট' : 'Joined today in Asia/Dhaka time'}
              </p>
            </div>
          </div>

          {/* 30-Day Signups Trend Chart */}
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-black text-xl text-foreground">
                  {isBn ? 'গত ৩০ দিনের সাইনআপ ট্রেন্ড' : '30-Day Signup Trend'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isBn ? 'প্রতিদিনের নতুন ব্যবহারকারী নিবন্ধনের চিত্র' : 'Daily member acquisition over past 30 days'}
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-lime-brand" />
            </div>

            <div className="h-64 w-full pt-4">
              {metrics?.signups30Days ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.signups30Days}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(val) => val.slice(5)}
                      fontSize={11}
                      stroke="#8E959D"
                    />
                    <YAxis allowDecimals={false} fontSize={11} stroke="#8E959D" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1A211E',
                        borderRadius: '16px',
                        border: '1px solid rgba(169, 242, 107, 0.3)',
                        color: '#FFFFFF',
                      }}
                    />
                    <Bar dataKey="signups" fill="#A9F26B" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  {isBn ? 'ডেটা লোড হচ্ছে...' : 'Loading chart metrics...'}
                </div>
              )}
            </div>
          </div>

          {/* Recent Logins Table (STRICT: Account-level only) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border space-y-4 shadow-xs">
            <div>
              <h3 className="font-display font-black text-xl text-foreground">
                {isBn ? 'সাম্প্রতিক লগইন ও অ্যাক্টিভিটি' : 'Recent Logins & Activity'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isBn
                  ? 'গোপনীয়তা রক্ষা: অ্যাডমিন শুধুমাত্র অ্যাকাউন্ট তথ্য দেখতে পারেন (কোনো ব্যক্তিগত খাবার বা ওজন দেখা যাবে না)'
                  : 'Privacy Enforced: Admins only inspect account metadata. Personal meal and weight logs are never accessible.'}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground uppercase tracking-wider">
                    <th className="py-3 px-3">{isBn ? 'অ্যাথলিট নিকনেম' : 'Athlete Nickname'}</th>
                    <th className="py-3 px-3">{isBn ? 'ইমেইল' : 'Email Address'}</th>
                    <th className="py-3 px-3">{isBn ? 'স্ট্যাটাস' : 'Account Status'}</th>
                    <th className="py-3 px-3">{isBn ? 'সর্বশেষ সক্রিয়' : 'Last Active'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {metrics?.recentLogins?.map((u) => (
                    <tr key={u._id} className="hover:bg-secondary/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-foreground">{u.nickname}</td>
                      <td className="py-3 px-3 font-mono text-muted-foreground">{u.email}</td>
                      <td className="py-3 px-3">
                        {u.disabled ? (
                          <span className="px-2 py-0.5 rounded-md bg-tomato-base/10 text-tomato-base font-bold text-[10px]">
                            {isBn ? 'ডিজেবল্ড' : 'Disabled'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-lime-brand/10 text-lime-brand font-bold text-[10px]">
                            {isBn ? 'সক্রিয়' : 'Active'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground font-mono">
                        {new Date(u.lastActiveAt).toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ANNOUNCEMENTS COMPOSER & HISTORY */}
      {activeTab === 'announcements' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {announcementFeedback && (
            <div className="p-4 rounded-2xl bg-lime-brand/10 border border-lime-brand text-lime-brand text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{announcementFeedback}</span>
            </div>
          )}

          {/* Composer Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border space-y-6 shadow-xs">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-2xl bg-lime-brand/10 text-lime-brand flex items-center justify-center">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-black text-xl text-foreground">
                  {isBn ? 'নতুন ঘোষণা কম্পোজার' : 'Broadcast Announcement'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isBn
                    ? 'সংরক্ষণ করার সাথে সাথে সকল ব্যবহারকারীর ইন-অ্যাপ বেল এবং ডিভাইসে পুশ পাঠানো হবে'
                    : 'Stores once in DB and triggers single FCM topic push to /topics/announcements'}
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowConfirmSendModal(true);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-foreground mb-1">
                    <span>{isBn ? 'শিরোনাম (বাংলা)' : 'Title (Bangla)'} *</span>
                    <span className="text-muted-foreground">{announcementForm.titleBn.length}/100</span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={announcementForm.titleBn}
                    onChange={(e) =>
                      setAnnouncementForm({ ...announcementForm, titleBn: e.target.value })
                    }
                    placeholder="যেমন: নতুন ফিটনেস চ্যালেঞ্জ শুরু হয়েছে!"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-lime-brand"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-foreground mb-1">
                    <span>{isBn ? 'শিরোনাম (English)' : 'Title (English)'} *</span>
                    <span className="text-muted-foreground">{announcementForm.title.length}/100</span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={announcementForm.title}
                    onChange={(e) =>
                      setAnnouncementForm({ ...announcementForm, title: e.target.value })
                    }
                    placeholder="e.g. New 30-Day Fitness Challenge Live!"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-lime-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-foreground mb-1">
                    <span>{isBn ? 'বার্তা বিবরণ (বাংলা)' : 'Content (Bangla)'} *</span>
                    <span className="text-muted-foreground">{announcementForm.contentBn.length}/500</span>
                  </div>
                  <textarea
                    required
                    rows={3}
                    maxLength={500}
                    value={announcementForm.contentBn}
                    onChange={(e) =>
                      setAnnouncementForm({ ...announcementForm, contentBn: e.target.value })
                    }
                    placeholder="বিস্তারিত বিবরণ..."
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-lime-brand"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-foreground mb-1">
                    <span>{isBn ? 'বার্তা বিবরণ (English)' : 'Content (English)'} *</span>
                    <span className="text-muted-foreground">{announcementForm.content.length}/500</span>
                  </div>
                  <textarea
                    required
                    rows={3}
                    maxLength={500}
                    value={announcementForm.content}
                    onChange={(e) =>
                      setAnnouncementForm({ ...announcementForm, content: e.target.value })
                    }
                    placeholder="Announcement details..."
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-lime-brand"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  {isBn ? 'ঘোষণার ধরণ' : 'Announcement Type'}
                </label>
                <select
                  value={announcementForm.type}
                  onChange={(e) =>
                    setAnnouncementForm({
                      ...announcementForm,
                      type: e.target.value as typeof announcementForm.type,
                    })
                  }
                  className="px-4 py-2 rounded-xl bg-background border border-border text-sm text-foreground cursor-pointer"
                >
                  <option value="info">Info (সাধারণ তথ্য)</option>
                  <option value="update">Platform Update (প্ল্যাটফর্ম আপডেট)</option>
                  <option value="celebration">Celebration (সাফল্য / মোটিভেশন)</option>
                  <option value="warning">Warning / Maintenance (সতর্কবার্তা)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-lime-brand hover:bg-lime-hover text-ink-base font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>{isBn ? 'ব্রডকাস্ট রিভিউ করুন' : 'Review & Broadcast'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Confirmation Modal */}
          {showConfirmSendModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="w-full max-w-md rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-lime-brand/10 text-lime-brand flex items-center justify-center mx-auto">
                  <Megaphone className="w-6 h-6" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-display font-black text-xl text-foreground">
                    {isBn ? 'সবার কাছে ব্রডকাস্ট পাঠাবেন?' : 'Broadcast to All Athletes?'}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isBn
                      ? 'এই ঘোষণাটি ডেটাবেসে সংরক্ষিত হবে এবং তাত্ক্ষণিকভাবে সকল ইউজারের ডিভাইসে পুশ নোটিফিকেশন হিসেবে চলে যাবে।'
                      : 'This announcement will be saved and pushed immediately to all subscribed devices via Firebase Cloud Messaging.'}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-secondary/50 border border-border text-xs space-y-1">
                  <span className="font-bold text-foreground block">{announcementForm.titleBn}</span>
                  <p className="text-muted-foreground">{announcementForm.contentBn}</p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setShowConfirmSendModal(false)}
                    className="flex-1 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs transition-colors"
                  >
                    {isBn ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleSendAnnouncement}
                    disabled={sendingAnnouncement}
                    className="flex-1 py-2 rounded-xl bg-lime-brand hover:bg-lime-hover text-ink-base font-bold text-xs uppercase transition-colors shadow-md disabled:opacity-50"
                  >
                    {sendingAnnouncement
                      ? isBn
                        ? 'পাঠানো হচ্ছে...'
                        : 'Broadcasting...'
                      : isBn
                        ? 'হ্যাঁ, ব্রডকাস্ট করুন'
                        : 'Yes, Broadcast'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Announcements History Table */}
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border space-y-4 shadow-xs">
            <h3 className="font-display font-black text-xl text-foreground">
              {isBn ? 'পূর্ববর্তী ঘোষণার ইতিহাস' : 'Announcement History'}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground uppercase tracking-wider">
                    <th className="py-3 px-3">{isBn ? 'তারিখ' : 'Date'}</th>
                    <th className="py-3 px-3">{isBn ? 'শিরোনাম' : 'Title'}</th>
                    <th className="py-3 px-3">{isBn ? 'ধরণ' : 'Type'}</th>
                    <th className="py-3 px-3">{isBn ? 'বিবরণ' : 'Content'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {announcements.map((a) => (
                    <tr key={a._id} className="hover:bg-secondary/40 transition-colors">
                      <td className="py-3 px-3 font-mono text-muted-foreground whitespace-nowrap">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 font-bold text-foreground">
                        {isBn ? a.titleBn : a.title}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-secondary font-bold text-[10px] uppercase">
                          {a.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground max-w-xs truncate">
                        {isBn ? a.contentBn : a.content}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USERS & ACCESS */}
      {activeTab === 'users' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border space-y-6 shadow-xs animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-black text-xl text-foreground">
                {isBn ? 'ইউজার তালিকা ও অ্যাক্সেস কন্ট্রোল' : 'User Accounts & Access Control'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isBn
                  ? 'অ্যাকাউন্ট সন্ধান করুন এবং অপব্যবহার বন্ধে ডিজেবল করুন (ডিজেবল্ড ইউজার সাইন-ইন করতে পারবে না)'
                  : 'Search members and disable abusive accounts (disabled users cannot sign in)'}
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={isBn ? 'নিকনেম বা ইমেইল খুঁজুন...' : 'Search nickname or email...'}
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  fetchUsers(e.target.value, 1);
                }}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-lime-brand"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-3">{isBn ? 'নিকনেম' : 'Nickname'}</th>
                  <th className="py-3 px-3">{isBn ? 'ইমেইল' : 'Email'}</th>
                  <th className="py-3 px-3">{isBn ? 'রোল' : 'Role'}</th>
                  <th className="py-3 px-3">{isBn ? 'যোগদান' : 'Joined'}</th>
                  <th className="py-3 px-3">{isBn ? 'সর্বশেষ সক্রিয়' : 'Last Active'}</th>
                  <th className="py-3 px-3 text-right">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {users.map((u) => {
                  const isSelf = u.email === adminEmail;
                  const isAdminUser = u.role === 'admin';
                  return (
                    <tr key={u._id} className="hover:bg-secondary/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-foreground">{u.nickname}</td>
                      <td className="py-3 px-3 font-mono text-muted-foreground">{u.email}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isAdminUser
                              ? 'bg-lime-brand/10 text-lime-brand border border-lime-brand/30'
                              : 'bg-secondary text-muted-foreground'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground font-mono">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground font-mono">
                        {new Date(u.lastActiveAt).toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isSelf || isAdminUser ? (
                          <span className="text-[11px] text-muted-foreground italic">
                            {isSelf ? (isBn ? 'আপনার অ্যাকাউন্ট' : 'Your Account') : isBn ? 'অ্যাডমিন সুরক্ষিত' : 'Protected Admin'}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleToggleDisable(u)}
                            disabled={actionUserId === u._id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              u.disabled
                                ? 'bg-lime-brand/10 hover:bg-lime-brand/20 text-lime-brand border border-lime-brand/30'
                                : 'bg-tomato-base/10 hover:bg-tomato-base/20 text-tomato-base border border-tomato-base/30'
                            }`}
                          >
                            {u.disabled
                              ? isBn
                                ? 'সক্রিয় করুন'
                                : 'Enable User'
                              : isBn
                                ? 'ডিজেবল করুন'
                                : 'Disable User'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4 border-t border-border text-xs text-muted-foreground">
            <span>
              {isBn ? `পৃষ্ঠা ${userPage} / ${totalUserPages}` : `Page ${userPage} of ${totalUserPages}`}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={userPage <= 1}
                onClick={() => fetchUsers(userSearch, userPage - 1)}
                className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 disabled:opacity-50 cursor-pointer"
              >
                {isBn ? 'পূর্ববর্তী' : 'Previous'}
              </button>
              <button
                disabled={userPage >= totalUserPages}
                onClick={() => fetchUsers(userSearch, userPage + 1)}
                className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 disabled:opacity-50 cursor-pointer"
              >
                {isBn ? 'পরবর্তী' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FOOD ITEMS CREATE & EDIT */}
      {activeTab === 'foods' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border space-y-6 shadow-xs animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-black text-xl text-foreground">
                {isBn ? 'খাদ্য তালিকা ডেটাবেস' : 'Bangladeshi Food Database'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isBn
                  ? 'খাবারের পুষ্টি মান যুক্ত ও পরিমার্জন করুন (ভেরিফায়েড করতে সোর্স আবশ্যক)'
                  : 'Manage nutrition values (source citation is strictly required for verified status)'}
              </p>
            </div>

            <button
              onClick={() => {
                setEditingFood({
                  nameBn: '',
                  nameEn: '',
                  category: 'grains',
                  source: '',
                  verified: false,
                  per100g: { kcal: 100, protein: 3, carbs: 20, fat: 1, fiber: 1 },
                });
                setFoodModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-lime-brand hover:bg-lime-hover text-ink-base font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{isBn ? 'নতুন খাবার যুক্ত করুন' : 'Add New Food'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-3">{isBn ? 'নাম' : 'Name'}</th>
                  <th className="py-3 px-3">{isBn ? 'ক্যাটাগরি' : 'Category'}</th>
                  <th className="py-3 px-3">{isBn ? 'ক্যালোরি / ১০০ গ্রাম' : 'Kcal / 100g'}</th>
                  <th className="py-3 px-3">{isBn ? 'প্রোটিন' : 'Protein'}</th>
                  <th className="py-3 px-3">{isBn ? 'ভেরিফায়েড' : 'Status'}</th>
                  <th className="py-3 px-3">{isBn ? 'সোর্স' : 'Source'}</th>
                  <th className="py-3 px-3 text-right">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {foods.slice(0, 30).map((f) => (
                  <tr key={f._id} className="hover:bg-secondary/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-foreground">
                      {f.nameBn} ({f.nameEn})
                    </td>
                    <td className="py-3 px-3 uppercase text-muted-foreground text-[10px] font-mono">
                      {f.category}
                    </td>
                    <td className="py-3 px-3 font-bold">{f.per100g?.kcal} kcal</td>
                    <td className="py-3 px-3 font-bold text-lime-brand">{f.per100g?.protein}g</td>
                    <td className="py-3 px-3">
                      {f.verified ? (
                        <span className="px-2 py-0.5 rounded-md bg-lime-brand/10 text-lime-brand font-bold text-[10px]">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-secondary text-muted-foreground font-bold text-[10px]">
                          Pending Review
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground max-w-xs truncate font-mono text-[11px]">
                      {f.source || '—'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setEditingFood(f);
                          setFoodModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors cursor-pointer"
                        title="Edit Food"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Food Edit / Create Modal */}
          {foodModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="w-full max-w-lg rounded-3xl bg-card border border-border p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <h3 className="font-display font-black text-xl text-foreground">
                  {editingFood?._id ? (isBn ? 'খাবার সম্পাদন করুন' : 'Edit Food Item') : isBn ? 'নতুন খাবার যোগ করুন' : 'Create Food Item'}
                </h3>

                {foodError && (
                  <div className="p-3 rounded-xl bg-tomato-base/10 border border-tomato-base text-tomato-base text-xs font-bold">
                    {foodError}
                  </div>
                )}

                <form onSubmit={handleSaveFood} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">Name (Bangla) *</label>
                      <input
                        type="text"
                        required
                        value={editingFood?.nameBn || ''}
                        onChange={(e) => setEditingFood({ ...editingFood, nameBn: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">Name (English) *</label>
                      <input
                        type="text"
                        required
                        value={editingFood?.nameEn || ''}
                        onChange={(e) => setEditingFood({ ...editingFood, nameEn: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <NumberField
                      label={<span className="text-[10px] font-bold text-muted-foreground">Kcal</span>}
                      required
                      value={editingFood?.per100g?.kcal ?? ''}
                      onChange={(val) =>
                        setEditingFood({
                          ...editingFood,
                          per100g: {
                            kcal: val === '' ? 0 : Number(val),
                            protein: editingFood?.per100g?.protein ?? 0,
                            carbs: editingFood?.per100g?.carbs ?? 0,
                            fat: editingFood?.per100g?.fat ?? 0,
                          },
                        })
                      }
                      placeholder="0"
                      inputClassName="px-2 py-1.5 text-xs font-mono rounded-lg"
                    />

                    <NumberField
                      label={<span className="text-[10px] font-bold text-muted-foreground">Protein (g)</span>}
                      allowDecimals
                      step="0.1"
                      required
                      value={editingFood?.per100g?.protein ?? ''}
                      onChange={(val) =>
                        setEditingFood({
                          ...editingFood,
                          per100g: {
                            kcal: editingFood?.per100g?.kcal ?? 0,
                            protein: val === '' ? 0 : Number(val),
                            carbs: editingFood?.per100g?.carbs ?? 0,
                            fat: editingFood?.per100g?.fat ?? 0,
                          },
                        })
                      }
                      placeholder="0"
                      inputClassName="px-2 py-1.5 text-xs font-mono rounded-lg"
                    />

                    <NumberField
                      label={<span className="text-[10px] font-bold text-muted-foreground">Carbs (g)</span>}
                      allowDecimals
                      step="0.1"
                      required
                      value={editingFood?.per100g?.carbs ?? ''}
                      onChange={(val) =>
                        setEditingFood({
                          ...editingFood,
                          per100g: {
                            kcal: editingFood?.per100g?.kcal ?? 0,
                            protein: editingFood?.per100g?.protein ?? 0,
                            carbs: val === '' ? 0 : Number(val),
                            fat: editingFood?.per100g?.fat ?? 0,
                          },
                        })
                      }
                      placeholder="0"
                      inputClassName="px-2 py-1.5 text-xs font-mono rounded-lg"
                    />

                    <NumberField
                      label={<span className="text-[10px] font-bold text-muted-foreground">Fat (g)</span>}
                      allowDecimals
                      step="0.1"
                      required
                      value={editingFood?.per100g?.fat ?? ''}
                      onChange={(val) =>
                        setEditingFood({
                          ...editingFood,
                          per100g: {
                            kcal: editingFood?.per100g?.kcal ?? 0,
                            protein: editingFood?.per100g?.protein ?? 0,
                            carbs: editingFood?.per100g?.carbs ?? 0,
                            fat: val === '' ? 0 : Number(val),
                          },
                        })
                      }
                      placeholder="0"
                      inputClassName="px-2 py-1.5 text-xs font-mono rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">
                      Source Citation (Required for Verified) *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. USDA FoodData Central #12345 or Certified Lab Report"
                      value={editingFood?.source || ''}
                      onChange={(e) => setEditingFood({ ...editingFood, source: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/50 border border-border">
                    <input
                      type="checkbox"
                      id="verifiedCheck"
                      checked={Boolean(editingFood?.verified)}
                      onChange={(e) => setEditingFood({ ...editingFood, verified: e.target.checked })}
                      className="w-4 h-4 rounded text-lime-brand cursor-pointer"
                    />
                    <label htmlFor="verifiedCheck" className="text-xs font-bold text-foreground cursor-pointer">
                      Mark as Verified (Requires filled source above)
                    </label>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setFoodModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-secondary text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-lime-brand text-ink-base font-bold text-xs uppercase shadow-md"
                    >
                      Save Item
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: EXERCISES CREATE & EDIT */}
      {activeTab === 'exercises' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border space-y-6 shadow-xs animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-black text-xl text-foreground">
                {isBn ? 'ব্যায়াম লাইব্রেরি ডেটাবেস' : 'Exercise Library Database'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isBn
                  ? 'ব্যায়াম গাইড ও ভিডিও আইডি সম্পাদনা করুন (ইউটিউব আইডি ১১ ক্যারেক্টার হতে হবে)'
                  : 'Manage exercises & video embeds (YouTube IDs must be exact 11-char strings or empty)'}
              </p>
            </div>

            <button
              onClick={() => {
                setEditingExercise({
                  nameBn: '',
                  nameEn: '',
                  slug: '',
                  muscle: 'chest',
                  equipment: 'bodyweight',
                  level: 'beginner',
                  youtubeId: '',
                  reviewed: false,
                });
                setExerciseModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-lime-brand hover:bg-lime-hover text-ink-base font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{isBn ? 'নতুন ব্যায়াম যুক্ত করুন' : 'Add New Exercise'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-3">{isBn ? 'ব্যায়ামের নাম' : 'Exercise Name'}</th>
                  <th className="py-3 px-3">{isBn ? 'টার্গেট পেশী' : 'Muscle'}</th>
                  <th className="py-3 px-3">{isBn ? 'যন্ত্রপাতি' : 'Equipment'}</th>
                  <th className="py-3 px-3">{isBn ? 'লেভেল' : 'Level'}</th>
                  <th className="py-3 px-3">{isBn ? 'ইউটিউব আইডি' : 'YouTube ID'}</th>
                  <th className="py-3 px-3">{isBn ? 'রিভিউ স্ট্যাটাস' : 'Review Status'}</th>
                  <th className="py-3 px-3 text-right">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {exercises.map((e) => (
                  <tr key={e._id} className="hover:bg-secondary/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-foreground">
                      {e.nameBn} ({e.nameEn})
                    </td>
                    <td className="py-3 px-3 uppercase text-muted-foreground font-mono text-[10px]">
                      {e.muscle}
                    </td>
                    <td className="py-3 px-3 uppercase text-muted-foreground font-mono text-[10px]">
                      {e.equipment}
                    </td>
                    <td className="py-3 px-3 uppercase text-muted-foreground font-mono text-[10px]">
                      {e.level}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      {e.youtubeId ? (
                        <span className="text-lime-brand flex items-center gap-1">
                          {e.youtubeId}
                          <ExternalLink className="w-3 h-3 inline" />
                        </span>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {e.reviewed ? (
                        <span className="px-2 py-0.5 rounded-md bg-lime-brand/10 text-lime-brand font-bold text-[10px]">
                          Reviewed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-tomato-base/10 text-tomato-base font-bold text-[10px]">
                          Reviewing
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setEditingExercise(e);
                          setExerciseModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors cursor-pointer"
                        title="Edit Exercise"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Exercise Modal */}
          {exerciseModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="w-full max-w-lg rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4">
                <h3 className="font-display font-black text-xl text-foreground">
                  {editingExercise?._id ? 'Edit Exercise' : 'Create Exercise'}
                </h3>

                {exerciseError && (
                  <div className="p-3 rounded-xl bg-tomato-base/10 border border-tomato-base text-tomato-base text-xs font-bold">
                    {exerciseError}
                  </div>
                )}

                <form onSubmit={handleSaveExercise} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">Name (Bangla) *</label>
                      <input
                        type="text"
                        required
                        value={editingExercise?.nameBn || ''}
                        onChange={(e) => setEditingExercise({ ...editingExercise, nameBn: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">Name (English) *</label>
                      <input
                        type="text"
                        required
                        value={editingExercise?.nameEn || ''}
                        onChange={(e) => setEditingExercise({ ...editingExercise, nameEn: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">Target Muscle</label>
                      <select
                        value={editingExercise?.muscle || 'chest'}
                        onChange={(e) => setEditingExercise({ ...editingExercise, muscle: e.target.value })}
                        className="w-full px-2 py-2 rounded-xl bg-background border border-border text-xs text-foreground"
                      >
                        {['chest', 'back', 'shoulders', 'arms', 'legs', 'core'].map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">Equipment</label>
                      <select
                        value={editingExercise?.equipment || 'bodyweight'}
                        onChange={(e) => setEditingExercise({ ...editingExercise, equipment: e.target.value })}
                        className="w-full px-2 py-2 rounded-xl bg-background border border-border text-xs text-foreground"
                      >
                        {['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight'].map((eq) => (
                          <option key={eq} value={eq}>
                            {eq}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">Level</label>
                      <select
                        value={editingExercise?.level || 'beginner'}
                        onChange={(e) => setEditingExercise({ ...editingExercise, level: e.target.value })}
                        className="w-full px-2 py-2 rounded-xl bg-background border border-border text-xs text-foreground"
                      >
                        {['beginner', 'intermediate', 'advanced'].map((lvl) => (
                          <option key={lvl} value={lvl}>
                            {lvl}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">
                      YouTube Video ID (11 characters, or leave blank)
                    </label>
                    <input
                      type="text"
                      maxLength={11}
                      placeholder="e.g. rT7DgCr-3pg"
                      value={editingExercise?.youtubeId || ''}
                      onChange={(e) => setEditingExercise({ ...editingExercise, youtubeId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/50 border border-border">
                    <input
                      type="checkbox"
                      id="reviewedCheck"
                      checked={Boolean(editingExercise?.reviewed)}
                      onChange={(e) => setEditingExercise({ ...editingExercise, reviewed: e.target.checked })}
                      className="w-4 h-4 rounded text-lime-brand cursor-pointer"
                    />
                    <label htmlFor="reviewedCheck" className="text-xs font-bold text-foreground cursor-pointer">
                      Mark as Reviewed Guide
                    </label>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setExerciseModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-secondary text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-lime-brand text-ink-base font-bold text-xs uppercase shadow-md"
                    >
                      Save Exercise
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: AUDIT LOG TRAIL */}
      {activeTab === 'audit' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border space-y-4 shadow-xs animate-in fade-in duration-200">
          <div>
            <h3 className="font-display font-black text-xl text-foreground">
              {isBn ? 'অ্যাডমিনিস্ট্রেটিভ অডিট ট্রেইল' : 'Administrative Audit Trail'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isBn
                ? 'প্ল্যাটফর্মে সম্পাদিত প্রতিটি অ্যাডমিন অ্যাকশন (কে, কী, কখন) ট্র্যাক করা হয়'
                : 'Accountability log recording administrative operations (who, what, when, IP)'}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-3">{isBn ? 'সময়' : 'Timestamp'}</th>
                  <th className="py-3 px-3">{isBn ? 'অ্যাডমিন ইমেইল' : 'Admin'}</th>
                  <th className="py-3 px-3">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                  <th className="py-3 px-3">{isBn ? 'টার্গেট / বিবরণ' : 'Details'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {auditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-secondary/40 transition-colors">
                    <td className="py-3 px-3 font-mono text-muted-foreground whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                    </td>
                    <td className="py-3 px-3 font-mono text-foreground font-bold">{log.adminEmail}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-secondary text-lime-brand font-bold text-[10px] uppercase font-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground font-mono text-[11px] max-w-md truncate">
                      {JSON.stringify(log.details || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
