'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useLanguage } from '@/lib/language-context';
import { guestStorage } from '@/lib/guest-storage';
import { NumberField } from '@/components/ui/number-field';
import {
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Bell,
  Clock,
  Smartphone,
  BellOff,
} from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  role: 'user' | 'admin';
  nickname: string;
  avatar?: string;
  timezone: string;
  optInLeaderboard?: boolean;
  notificationPreferences?: {
    workoutReminderTime?: string;
    mealReminderTime?: string;
    notificationsOptOut: boolean;
  };
  profile: {
    gender: 'male' | 'female';
    weightKg: number;
    heightCm: number;
    age: number;
    targetWeightKg?: number;
    calorieTarget?: number;
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active';
  };
}

export function SettingsClient() {
  const { t } = useLanguage();
  const { status } = useSession();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states with lazy initializers from guestStorage
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>(() => guestStorage.getProfile().gender);
  const [ageStr, setAgeStr] = useState<string>(() => String(guestStorage.getProfile().age || 26));
  const [heightCmStr, setHeightCmStr] = useState<string>(() => String(guestStorage.getProfile().heightCm || 172));
  const [weightKgStr, setWeightKgStr] = useState<string>(() => String(guestStorage.getProfile().weightKg || 70));
  const [activityLevel, setActivityLevel] = useState<
    'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active'
  >(() => {
    const act = guestStorage.getProfile().activityLevel;
    if (
      act === 'sedentary' ||
      act === 'light' ||
      act === 'moderate' ||
      act === 'very_active' ||
      act === 'extra_active'
    ) {
      return act;
    }
    return 'moderate';
  });
  const [customCalorieTarget, setCustomCalorieTarget] = useState<string>(() => {
    const target = guestStorage.getProfile().customCalorieTarget;
    return target ? String(target) : '';
  });
  const [optInLeaderboard, setOptInLeaderboard] = useState<boolean>(false);

  // Notification Preferences
  const [workoutReminderTime, setWorkoutReminderTime] = useState<string>('18:00');
  const [mealReminderTime, setMealReminderTime] = useState<string>('13:00');
  const [notificationsOptOut, setNotificationsOptOut] = useState<boolean>(false);

  // Delete account confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  const applyUserData = useCallback((u: UserData) => {
    setUserData(u);
    setNickname(u.nickname || '');
    if (typeof u.optInLeaderboard === 'boolean') {
      setOptInLeaderboard(u.optInLeaderboard);
    }
    if (u.notificationPreferences) {
      if (u.notificationPreferences.workoutReminderTime) {
        setWorkoutReminderTime(u.notificationPreferences.workoutReminderTime);
      }
      if (u.notificationPreferences.mealReminderTime) {
        setMealReminderTime(u.notificationPreferences.mealReminderTime);
      }
      if (typeof u.notificationPreferences.notificationsOptOut === 'boolean') {
        setNotificationsOptOut(u.notificationPreferences.notificationsOptOut);
      }
    }
    if (u.profile) {
      setGender(u.profile.gender || 'male');
      setAgeStr(String(u.profile.age || 26));
      setHeightCmStr(String(u.profile.heightCm || 172));
      setWeightKgStr(String(u.profile.weightKg || 70));
      setActivityLevel(
        u.profile.activityLevel === 'sedentary' ||
        u.profile.activityLevel === 'light' ||
        u.profile.activityLevel === 'moderate' ||
        u.profile.activityLevel === 'very_active' ||
        u.profile.activityLevel === 'extra_active'
          ? u.profile.activityLevel
          : 'moderate'
      );
      if (u.profile.calorieTarget) {
        setCustomCalorieTarget(String(u.profile.calorieTarget));
      }
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      const res = await fetch('/api/user');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          applyUserData(json.data);
        }
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  }, [applyUserData]);

  useEffect(() => {
    let isMounted = true;
    if (status === 'authenticated') {
      fetch('/api/user')
        .then((res) => res.json())
        .then((json) => {
          if (isMounted && json.success && json.data) {
            applyUserData(json.data);
          }
        })
        .catch((err) => {
          console.error('Error loading settings:', err);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [status, applyUserData]);

  const parsedAge = ageStr.trim() === '' ? undefined : parseFloat(ageStr);
  const parsedHeight = heightCmStr.trim() === '' ? undefined : parseFloat(heightCmStr);
  const parsedWeight = weightKgStr.trim() === '' ? undefined : parseFloat(weightKgStr);

  const isAgeValid =
    parsedAge !== undefined && !isNaN(parsedAge) && parsedAge >= 10 && parsedAge <= 100;
  const isHeightValid =
    parsedHeight !== undefined && !isNaN(parsedHeight) && parsedHeight >= 100 && parsedHeight <= 250;
  const isWeightValid =
    parsedWeight !== undefined && !isNaN(parsedWeight) && parsedWeight >= 30 && parsedWeight <= 300;
  const isProfileValid = isAgeValid && isHeightValid && isWeightValid;

  const ageError = !isAgeValid
    ? ageStr.trim() === ''
      ? t('বয়স প্রদান করুন', 'Age is required')
      : t('বয়স ১০-১০০ এর মধ্যে হতে হবে', 'Age must be 10-100')
    : undefined;

  const heightError = !isHeightValid
    ? heightCmStr.trim() === ''
      ? t('উচ্চতা প্রদান করুন', 'Height is required')
      : t('উচ্চতা ১০০-২৫০ সেমি হতে হবে', 'Height must be 100-250 cm')
    : undefined;

  const weightError = !isWeightValid
    ? weightKgStr.trim() === ''
      ? t('ওজন প্রদান করুন', 'Weight is required')
      : t('ওজন ৩০-৩০০ কেজি হতে হবে', 'Weight must be 30-300 kg')
    : undefined;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isProfileValid || parsedAge === undefined || parsedHeight === undefined || parsedWeight === undefined) {
      return;
    }
    setSaving(true);
    setSaveSuccess(false);

    const calorieTargetVal = customCalorieTarget.trim()
      ? parseInt(customCalorieTarget, 10)
      : null;

    if (status === 'authenticated') {
      try {
        const res = await fetch('/api/user', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nickname,
            gender,
            age: Math.round(parsedAge),
            heightCm: Math.round(parsedHeight),
            weightKg: Number(parsedWeight.toFixed(1)),
            activityLevel,
            calorieTarget: calorieTargetVal,
            optInLeaderboard,
          }),
        });

        // Also update notification preferences
        await fetch('/api/user/notification-preferences', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workoutReminderTime,
            mealReminderTime,
            notificationsOptOut,
          }),
        });

        if (res.ok) {
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
          fetchUserData();
        }
      } catch (err) {
        console.error('Failed to update profile:', err);
      } finally {
        setSaving(false);
      }
      return;
    }

    // Guest profile update
    guestStorage.saveProfile({
      gender,
      age: Math.round(parsedAge),
      heightCm: Math.round(parsedHeight),
      weightKg: Number(parsedWeight.toFixed(1)),
      activityLevel,
      goal: 'loss',
      customCalorieTarget: calorieTargetVal || undefined,
    });
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDeleteAccount = async () => {
    if (deleteInput.toLowerCase() !== 'delete') return;

    try {
      setDeleting(true);
      const res = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmText: 'DELETE' }),
      });

      if (res.ok) {
        // Clear guest storage flags as well
        localStorage.removeItem('zgym_guest_data_merged');
        await signOut({ callbackUrl: '/' });
      }
    } catch (err) {
      console.error('Failed to delete account:', err);
      setDeleting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:py-12 space-y-8">
      {/* Page Title */}
      <div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime-soft text-ink-base border border-lime-brand/40 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-ink-base" />
          <span>{status === 'authenticated' ? t('ইউজার সেটিংস', 'Account Settings') : t('গেস্ট সেটিংস', 'Guest Profile')}</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-foreground">
          {t('প্রোফাইল ও অ্যাকাউন্ট সেটিংস', 'Profile & Settings')}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {t('আপনার ব্যক্তিগত শারীরিক তথ্য, ক্যালোরি লক্ষ্য ও অ্যাকাউন্ট ডেটা পরিচালনা করুন।', 'Manage your biometric profile, daily calorie goal, and account data.')}
        </p>
      </div>

      {/* Account Info Card (If logged in) */}
      {status === 'authenticated' && userData && (
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="font-display font-black text-xl text-foreground">
              {t('অ্যাকাউন্ট বিবরণ', 'Account Information')}
            </h3>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-lime-soft text-ink-base border border-lime-brand/30">
              {userData.role === 'admin' ? 'Admin' : 'Member'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div>
              <span className="text-muted-foreground block mb-0.5">{t('ইমেইল', 'Email')}</span>
              <span className="font-bold text-foreground font-mono">{userData.email}</span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-0.5">{t('টাইমজোন', 'Timezone')}</span>
              <span className="font-bold text-foreground">{userData.timezone}</span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-0.5">{t('লগইন মেথড', 'Auth Provider')}</span>
              <span className="font-bold text-foreground">Google OAuth (Auth.js)</span>
            </div>
          </div>
        </div>
      )}

      {/* Biometrics & Profile Form */}
      <form onSubmit={handleSaveProfile} className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h3 className="font-display font-black text-xl text-foreground">
            {t('শারীরিক তথ্য ও ক্যালোরি লক্ষ্য', 'Biometrics & Calorie Goal')}
          </h3>
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-lime-brand animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4" />
              {t('সফলভাবে সংরক্ষিত হয়েছে!', 'Saved successfully!')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Nickname (Logged-in only) */}
          {status === 'authenticated' && (
            <div className="sm:col-span-2 space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                  {t('ডাকনাম / নিকনেম', 'Nickname')} *
                </label>
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={20}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-lime-brand"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  {t(
                    '৩ থেকে ২০ অক্ষরের নিকনেম। এটি লিডারবোর্ড ও গ্রুপ চ্যালেঞ্জে ব্যবহৃত হয়।',
                    '3-20 characters nickname used on leaderboard and group challenges.'
                  )}
                </p>
              </div>

              {/* Opt-in Leaderboard Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/30 border border-border/60">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-foreground block">
                    {t('কমিউনিটি লিডারবোর্ডে অংশ নিন', 'Join Community Leaderboard')}
                  </span>
                  <span className="text-[11px] text-muted-foreground block">
                    {t(
                      'আপনার নিকনেম ও স্ট্রিক লিডারবোর্ডে প্রদর্শিত হবে। আসল নাম বা ওজন গোপন থাকবে।',
                      'Display your nickname and streak publicly. Email, photo, and kg weight remain private.'
                    )}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={optInLeaderboard}
                    onChange={(e) => setOptInLeaderboard(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-lime-brand"></div>
                </label>
              </div>
            </div>
          )}

          {/* Gender */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
              {t('লিঙ্গ', 'Gender')} *
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as 'male' | 'female')}
              className="w-full px-4 py-2.5 rounded-2xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-lime-brand cursor-pointer"
            >
              <option value="male">{t('পুরুষ (Male)', 'Male')}</option>
              <option value="female">{t('নারী (Female)', 'Female')}</option>
            </select>
          </div>

          {/* Age */}
          <NumberField
            id="settings-age"
            label={<span className="text-xs font-semibold text-muted-foreground">{t('বয়স (বছর)', 'Age (Years)')} *</span>}
            unit="yrs"
            value={ageStr}
            onChange={(val) => setAgeStr(val)}
            min={10}
            max={100}
            required
            error={!isAgeValid}
            errorMessage={ageError}
            placeholder="26"
            inputClassName="rounded-2xl font-mono"
            aria-label="Age in years"
          />

          {/* Height */}
          <NumberField
            id="settings-height"
            label={<span className="text-xs font-semibold text-muted-foreground">{t('উচ্চতা (সেমি)', 'Height (cm)')} *</span>}
            unit="cm"
            value={heightCmStr}
            onChange={(val) => setHeightCmStr(val)}
            min={100}
            max={250}
            required
            error={!isHeightValid}
            errorMessage={heightError}
            placeholder="172"
            inputClassName="rounded-2xl font-mono"
            aria-label="Height in centimeters"
          />

          {/* Weight */}
          <NumberField
            id="settings-weight"
            label={<span className="text-xs font-semibold text-muted-foreground">{t('ওজন (কেজি)', 'Weight (kg)')} *</span>}
            unit="kg"
            allowDecimals
            step="0.1"
            value={weightKgStr}
            onChange={(val) => setWeightKgStr(val)}
            min={30}
            max={300}
            required
            error={!isWeightValid}
            errorMessage={weightError}
            placeholder="70.0"
            inputClassName="rounded-2xl font-mono"
            aria-label="Weight in kilograms"
          />

          {/* Activity Level */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
              {t('দৈনিক সক্রিয়তা', 'Activity Level')} *
            </label>
            <select
              value={activityLevel}
              onChange={(e) =>
                setActivityLevel(
                  e.target.value as 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active'
                )
              }
              className="w-full px-4 py-2.5 rounded-2xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-lime-brand cursor-pointer"
            >
              <option value="sedentary">{t('অলস / ডেস্কে বসে কাজ (Sedentary)', 'Sedentary (Little/no exercise)')}</option>
              <option value="light">{t('হালকা এক্টিভ (Light 1-3 days/wk)', 'Light (1-3 days/wk)')}</option>
              <option value="moderate">{t('মধ্যম এক্টিভ (Moderate 3-5 days/wk)', 'Moderate (3-5 days/wk)')}</option>
              <option value="very_active">{t('ভারী এক্টিভ (Heavy 6-7 days/wk)', 'Very Active (6-7 days/wk)')}</option>
              <option value="extra_active">{t('প্রফেশনাল অ্যাথলিট (Athlete/2x day)', 'Extra Active (Athlete/2x day)')}</option>
            </select>
          </div>

          {/* Custom Calorie Target Override */}
          <NumberField
            id="settings-custom-calories"
            label={<span className="text-xs font-semibold text-muted-foreground">{t('কাস্টম ক্যালোরি টার্গেট (ঐচ্ছিক)', 'Custom Calorie Target (Optional)')}</span>}
            unit="kcal"
            min={800}
            max={10000}
            value={customCalorieTarget}
            onChange={(val) => setCustomCalorieTarget(val)}
            placeholder={t('স্বয়ংক্রিয় BMR/TDEE ব্যবহার করতে ফাঁকা রাখুন', 'Leave blank to use auto TDEE')}
            inputClassName="rounded-2xl font-mono"
            aria-label="Custom calorie target in kcal"
          />
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <button
            type="submit"
            disabled={saving || !isProfileValid}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-lime-brand hover:bg-lime-hover text-ink-base font-black text-xs uppercase tracking-wider transition-colors shadow-md disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? t('সংরক্ষণ হচ্ছে...', 'Saving...') : t('পরিবর্তন সংরক্ষণ করুন', 'Save Changes')}</span>
          </button>
        </div>
      </form>

      {/* Push Reminders & Notifications Card */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lime-brand/10 border border-lime-brand/30 flex items-center justify-center text-lime-brand">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-xl text-foreground">
                {t('পুশ রিমাইন্ডার ও নোটিফিকেশন', 'Push Reminders & Alerts')}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t(
                  'ওয়ার্কআউট ও খাবারের সময় মতো নোটিফিকেশন পান (টাইমজোন: Asia/Dhaka)',
                  'Timely workout and nutrition reminders in your local timezone'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Opt-out Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/40 border border-border">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {notificationsOptOut ? (
                <BellOff className="w-4 h-4 text-tomato-base" />
              ) : (
                <Bell className="w-4 h-4 text-lime-brand" />
              )}
              <span className="font-bold text-sm text-foreground">
                {t('নোটিফিকেশন চালু রাখুন', 'Enable Push Notifications')}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t(
                'বন্ধ করলে আপনি কোনো ধরনের রিমাইন্ডার পাবেন না',
                'Disable to mute all automated workout and meal alerts'
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setNotificationsOptOut(!notificationsOptOut)}
            className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
              !notificationsOptOut ? 'bg-lime-brand' : 'bg-muted'
            }`}
            aria-label="Toggle notifications"
          >
            <div
              className={`w-5 h-5 rounded-full bg-ink-base transition-transform duration-200 ease-in-out ${
                !notificationsOptOut ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Reminder Time Selectors */}
        {!notificationsOptOut && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Workout Reminder */}
            <div className="p-4 rounded-2xl bg-secondary/30 border border-border space-y-2">
              <label className="text-xs font-bold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-lime-brand" />
                <span>{t('ওয়ার্কআউট রিমাইন্ডার সময়', 'Workout Reminder Time')}</span>
              </label>
              <select
                value={workoutReminderTime}
                onChange={(e) => setWorkoutReminderTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-lime-brand cursor-pointer"
              >
                {['06:00', '07:00', '08:00', '09:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'].map(
                  (time) => (
                    <option key={time} value={time}>
                      {time} ({time.startsWith('0') || parseInt(time) < 12 ? 'সকাল / Morning' : 'বিকাল/রাত / Evening'})
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Meal Reminder */}
            <div className="p-4 rounded-2xl bg-secondary/30 border border-border space-y-2">
              <label className="text-xs font-bold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-pink-brand" />
                <span>{t('খাবারের পুষ্টি রিমাইন্ডার সময়', 'Meal Reminder Time')}</span>
              </label>
              <select
                value={mealReminderTime}
                onChange={(e) => setMealReminderTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-lime-brand cursor-pointer"
              >
                {['08:00', '12:00', '13:00', '14:00', '19:00', '20:00', '21:00'].map((time) => (
                  <option key={time} value={time}>
                    {time} ({time === '12:00' || time === '13:00' || time === '14:00' ? 'দুপুর / Lunch' : 'রাত / Dinner'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* iOS Notice (Required by spec) */}
        <div className="p-4 rounded-2xl bg-secondary/20 border border-border/80 flex items-start gap-3">
          <Smartphone className="w-5 h-5 text-lime-brand shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-muted-foreground leading-relaxed">
            <span className="font-bold text-foreground block">
              {t('অ্যাপল iOS (iPhone/iPad) ব্যবহারকারীদের জন্য নোট:', 'Note for Apple iOS (iPhone/iPad) Users:')}
            </span>
            <p>
              {t(
                'আইফোনে পুশ নোটিফিকেশন পেতে হলে iOS 16.4 বা পরবর্তী সংস্করণ প্রয়োজন এবং Z-Gym অ্যাপটি Safari ব্রাউজারের Share বাটনে ট্যাপ করে "Add to Home Screen" করে নিতে হবে।',
                'To receive push notifications on iOS, iOS 16.4+ is required and Z-Gym must be added to your Home Screen first (Safari Share > Add to Home Screen).'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone: Delete My Account (Logged-in only) */}
      {status === 'authenticated' && (
        <div className="rounded-3xl border border-tomato-base/40 bg-tomato-base/5 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 text-tomato-base">
            <AlertTriangle className="w-5 h-5 stroke-2" />
            <h3 className="font-display font-black text-xl">
              {t('বিপদজনক অঞ্চল (Danger Zone)', 'Danger Zone')}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
            {t(
              'অ্যাকাউন্ট মুছে ফেললে আপনার সকল সংরক্ষিত খাবার, দৈনিক সারাংশ, ওজন ইতিহাস ও স্ট্রিক ডেটা স্থায়ীভাবে মুছে যাবে। এই কাজটি আর পুনরুদ্ধার করা সম্ভব নয়।',
              'Deleting your account will permanently purge all meals, weight logs, workout history, and streak data. This action is irreversible.'
            )}
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-tomato-base text-white hover:bg-tomato-deep text-xs font-black uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t('অ্যাকাউন্ট ডিলিট করুন', 'Delete My Account')}</span>
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-card border border-tomato-base/40 p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-tomato-base/10 text-tomato-base flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 stroke-2" />
            </div>
            <div className="text-center">
              <h3 className="font-display font-black text-2xl uppercase tracking-tight text-foreground">
                {t('আপনি কি নিশ্চিত?', 'Are you absolutely sure?')}
              </h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {t(
                  'আপনার অ্যাকাউন্ট ও ক্লাউড ডেটা স্থায়ীভাবে মুছে যাবে। নিশ্চিত করতে নিচে "delete" টাইপ করুন:',
                  'All your cloud fitness records will be wiped permanently. Type "delete" below to confirm:'
                )}
              </p>
            </div>

            <div>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="delete"
                className="w-full text-center px-4 py-2.5 rounded-2xl bg-background border border-border text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-tomato-base"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteInput('');
                }}
                className="flex-1 py-2.5 rounded-full border border-border text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {t('বাতিল', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteInput.toLowerCase() !== 'delete' || deleting}
                className="flex-1 py-2.5 rounded-full bg-tomato-base hover:bg-tomato-deep text-white font-black text-xs uppercase tracking-wider transition-colors disabled:opacity-40 cursor-pointer shadow-md"
              >
                {deleting ? t('মুছে ফেলা হচ্ছে...', 'Deleting...') : t('ডিলিট নিশ্চিত করুন', 'Confirm Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
