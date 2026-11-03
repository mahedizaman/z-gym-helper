'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useLanguage } from '@/lib/language-context';
import { guestStorage } from '@/lib/guest-storage';
import {
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  role: 'user' | 'admin';
  nickname: string;
  avatar?: string;
  timezone: string;
  optInLeaderboard?: boolean;
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
  const [age, setAge] = useState<number>(() => guestStorage.getProfile().age);
  const [heightCm, setHeightCm] = useState<number>(() => guestStorage.getProfile().heightCm);
  const [weightKg, setWeightKg] = useState<number>(() => guestStorage.getProfile().weightKg);
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
    if (u.profile) {
      setGender(u.profile.gender || 'male');
      setAge(u.profile.age || 26);
      setHeightCm(u.profile.heightCm || 172);
      setWeightKg(u.profile.weightKg || 70);
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
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
            age,
            heightCm,
            weightKg,
            activityLevel,
            calorieTarget: calorieTargetVal,
            optInLeaderboard,
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
      age,
      heightCm,
      weightKg,
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
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
              {t('বয়স (বছর)', 'Age (Years)')} *
            </label>
            <input
              type="number"
              min="14"
              max="99"
              required
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value, 10))}
              className="w-full px-4 py-2.5 rounded-2xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-lime-brand font-mono"
            />
          </div>

          {/* Height */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
              {t('উচ্চতা (সেমি)', 'Height (cm)')} *
            </label>
            <input
              type="number"
              min="100"
              max="240"
              required
              value={heightCm}
              onChange={(e) => setHeightCm(parseFloat(e.target.value))}
              className="w-full px-4 py-2.5 rounded-2xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-lime-brand font-mono"
            />
          </div>

          {/* Weight */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
              {t('ওজন (কেজি)', 'Weight (kg)')} *
            </label>
            <input
              type="number"
              step="0.1"
              min="30"
              max="300"
              required
              value={weightKg}
              onChange={(e) => setWeightKg(parseFloat(e.target.value))}
              className="w-full px-4 py-2.5 rounded-2xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-lime-brand font-mono"
            />
          </div>

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
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
              {t('কাস্টম ক্যালোরি টার্গেট (ঐচ্ছিক)', 'Custom Calorie Target (Optional)')}
            </label>
            <input
              type="number"
              min="1200"
              max="6000"
              value={customCalorieTarget}
              onChange={(e) => setCustomCalorieTarget(e.target.value)}
              placeholder={t('স্বয়ংক্রিয় BMR/TDEE ব্যবহার করতে ফাঁকা রাখুন', 'Leave blank to use auto TDEE')}
              className="w-full px-4 py-2.5 rounded-2xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-lime-brand font-mono"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-lime-brand hover:bg-lime-hover text-ink-base font-black text-xs uppercase tracking-wider transition-colors shadow-md disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? t('সংরক্ষণ হচ্ছে...', 'Saving...') : t('পরিবর্তন সংরক্ষণ করুন', 'Save Changes')}</span>
          </button>
        </div>
      </form>

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
