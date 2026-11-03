'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';
import {
  ShieldCheck,
  Lock,
  Eye,
  Bell,
  Cookie,
  BadgeAlert,
  Server,
  Trash2,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-16 md:py-24">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-lime-soft border border-lime-brand/30 text-ink-base text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t('ডেটা ও নিরাপত্তা নীতি', 'Data & Privacy Policy')}</span>
        </div>
        <h1 className="font-display font-black text-fluid-section uppercase tracking-tight text-foreground">
          {t('গোপনীয়তা নীতিমালা', 'PRIVACY POLICY')}
        </h1>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
          {t(
            'জেড-জিম হেল্পারে (Z-Gym Helper) আপনার ব্যক্তিগত তথ্যের সুরক্ষা এবং স্বচ্ছতা আমাদের সর্বোচ্চ অগ্রাধিকার। আমাদের প্রযুক্তিগত নীতিমালা নিচে বিস্তারিত বর্ণিত হলো।',
            'How Z-Gym Helper protects, stores, and handles your personal fitness and nutritional data with total transparency.'
          )}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {t('সর্বশেষ হালনাগাদ: নভেম্বর ২০২৬', 'Last Updated: November 2026')}
        </p>
      </div>

      <div className="flex flex-col gap-8 text-foreground text-sm sm:text-base leading-relaxed">
        {/* 1. Guest Mode & Local Storage */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm">
          <h2 className="font-display text-xl font-bold uppercase mb-3 flex items-center gap-2 text-lime-hover">
            <Lock className="w-5 h-5 text-lime-brand shrink-0" />
            <span>{t('১. গেস্ট-ফার্স্ট অভিজ্ঞতা ও লোকাল স্টোরেজ', '1. Guest-First Architecture & Local Storage')}</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t(
              'আপনি একাউন্ট না খুলে সাধারণ ব্যবহারকারী বা গেস্ট হিসেবে সমস্ত ক্যালকুলেটর, ফুড সার্চ ও ব্যায়াম গাইড ব্যবহার করতে পারেন। আপনার দৈনিক মিল লগ, বিএমআই হিসাব ও ওজন লক্ষ্য সম্পূর্ণভাবে আপনার ডিভাইসের লোকাল স্টোরেজে (localStorage) সংরক্ষিত থাকে। কোনো রিমোট সার্ভারে এই তথ্য পাঠানো হয় না।',
              'You can use all calculators, Bangladeshi food databases, and exercise libraries without creating an account. When in guest mode, your daily meal selections, custom weight targets, and exercise burns are stored strictly on your device (localStorage) and are never transmitted to our backend.'
            )}
          </p>
        </div>

        {/* 2. Google Sign-In & Stored User Profile */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm">
          <h2 className="font-display text-xl font-bold uppercase mb-3 flex items-center gap-2 text-pink-brand">
            <Eye className="w-5 h-5 shrink-0" />
            <span>{t('২. গুগল সাইন-ইন ও সংরক্ষিত ব্যক্তিগত তথ্য', '2. Google Sign-In & Stored Account Data')}</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            {t(
              'একাউন্ট তৈরি করার জন্য আমরা শুধুমাত্র নিরাপদ Google OAuth (Auth.js) ব্যবহার করি। কোনো পাসওয়ার্ড আমরা সংরক্ষণ করি না। লগইন করার পর স্বয়ংক্রিয়ভাবে ৩-২০ অক্ষরের একটি র্যান্ডম ডাকনাম (যেমন "Athlete-4821") তৈরি হয়। আপনার আসল নাম, গুগল ইমেইল বা ছবি কখনোই লিডারবোর্ড বা কোনো পাবলিক স্ক্রিনে প্রদর্শিত হয় না।',
              'Authentication is exclusively handled via Google OAuth through Auth.js; we never request or store passwords. Each user is assigned a random nickname (e.g. "Athlete-4821") ranging between 3 to 20 characters. Your real name, Google email address, and profile photo are strictly kept private and never exposed publicly on leaderboards or friend challenges.'
            )}
          </p>
          <div className="p-4 rounded-2xl bg-secondary/50 border border-border text-xs text-muted-foreground space-y-1">
            <strong className="text-foreground block">{t('সার্ভারে যা সংরক্ষিত হয়:', 'Data stored upon registration:')}</strong>
            <p>• {t('ইউজার প্রোফাইল: ওজন, উচ্চতা, বয়স, লিঙ্গ, ফিটনেস লক্ষ্য ও ডাকনাম।', 'User Profile: Weight, height, age, biological sex, fitness goal, and display nickname.')}</p>
            <p>• {t('লগ হিস্ট্রি: দৈনিক ক্যালোরি ব্যালেন্স, ম্যাক্রোস এবং ওজনের পরিবর্তন।', 'Log History: Daily caloric balance, macro splits, weight snapshots, and activity streaks.')}</p>
            <p>• {t('চ্যালেঞ্জ ও নোটিফিকেশন সেটিংস: ইউজার-নির্ধারিত খাবারের ও ব্যায়ামের সময়।', 'Challenges & Preferences: Friend challenge participation and user-configured reminder times.')}</p>
          </div>
        </div>

        {/* 3. Push Notifications (FCM) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm">
          <h2 className="font-display text-xl font-bold uppercase mb-3 flex items-center gap-2 text-lime-hover">
            <Bell className="w-5 h-5 text-lime-brand shrink-0" />
            <span>{t('৩. পুশ নোটিফিকেশন (Firebase Cloud Messaging)', '3. Push Notifications & Reminders (Firebase FCM)')}</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            {t(
              'Z-Gym Helper গুগল ফায়ারবেস ক্লাউড মেসেজিং (FCM) ব্যবহার করে ব্যবহারকারীর নির্ধারিত মিল ও ওয়ার্কআউট রিমাইন্ডার এবং প্ল্যাটফর্ম ঘোষণা পাঠায়। এই সুবিধা সম্পূর্ণ ঐচ্ছিক। পুশ সক্রিয় করার সময় তৈরি হওয়া ডিভাইস টোকেনটি এনক্রিপ্টেড অবস্থায় ব্যবহারকারী অ্যাকাউন্টের সাথে সংরক্ষিত থাকে।',
              'We use Firebase Cloud Messaging (FCM) to deliver optional user-scheduled meal reminders, workout alerts in your local timezone, and platform announcements. Device registration tokens are encrypted and linked to your user record. You may opt out or modify reminder intervals anytime in your Settings.'
            )}
          </p>
          <p className="text-xs text-muted-foreground italic">
            {t(
              '* iOS ব্যবহারকারীদের জন্য: Safari-তে PWA হিসেবে "Add to Home Screen" করার পরেই শুধুমাত্র পুশ নোটিফিকেশন সক্রিয় হয়।',
              '* Note for iOS users: Push notifications require adding the web app to your Home Screen via Safari.'
            )}
          </p>
        </div>

        {/* 4. Cookies & Local Preference Storage */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm">
          <h2 className="font-display text-xl font-bold uppercase mb-3 flex items-center gap-2 text-pink-brand">
            <Cookie className="w-5 h-5 shrink-0" />
            <span>{t('৪. কুকিজ ও ব্রাউজার সেশন', '4. Cookies & Browser Session Storage')}</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t(
              'আমরা কেবল সাইন-ইন সেশন রক্ষণাবেক্ষণ (Auth.js session cookie), ভাষা পছন্দ (বাংলা/ইংরেজি) এবং কনসেন্ট সম্মতি ট্র্যাকিংয়ের জন্য প্রয়োজনীয় প্রথম-পক্ষের কুকিজ ব্যবহার করি। আমরা কোনো অননুমোদিত থার্ড-পার্টি ক্রস-সাইট ট্র্যাকিং কুকি বসাই না।',
              'We use essential first-party cookies strictly to maintain secure authenticated sessions (Auth.js session tokens), persist your language toggle (Bangla / English), and remember your cookie consent preferences. We do not use intrusive cross-site tracking cookies.'
            )}
          </p>
        </div>

        {/* 5. Planned Advertising (Google AdSense) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm">
          <h2 className="font-display text-xl font-bold uppercase mb-3 flex items-center gap-2 text-tomato-brand">
            <BadgeAlert className="w-5 h-5 shrink-0" />
            <span>{t('৫. পরিকল্পিত বিজ্ঞাপন ও গুগল অ্যাডসেন্স', '5. Planned Advertising & Google AdSense')}</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            {t(
              'সার্ভার ও ডেটাবেজ রক্ষণাবেক্ষণের খরচ মেটানোর জন্য ভবিষ্যতে প্রাসঙ্গিক ও অ-আক্রমণাত্মক বিজ্ঞাপন (Google AdSense) প্রদর্শিত হতে পারে। ডিফল্টভাবে সিস্টেম বিজ্ঞাপন বন্ধ রাখে (NEXT_PUBLIC_ADS_ENABLED=false)। বিজ্ঞাপন সক্রিয় হলে গুগল বিজ্ঞাপন কুকিজ ব্যবহার করতে পারে যা আপনি আমাদের কনসেন্ট ব্যানার বা ব্রাউজার সেটিংসে নিয়ন্ত্রণ করতে পারেন।',
              'To offset database infrastructure and open hosting costs, Z-Gym Helper reserves static layout slots for non-intrusive Google AdSense advertising. Ads are disabled by default (NEXT_PUBLIC_ADS_ENABLED=false). When enabled, Google may use standard advertising cookies in accordance with Google Privacy Policies.'
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {t(
              'কঠোর নীতি: লগইন (/login), অ্যাকাউন্ট সেটিংস (/settings), এবং অ্যাডমিন প্যানেলে (/admin) কখনই কোনো বিজ্ঞাপন দেখানো হয় না।',
              'Strict Policy: Advertisements are strictly prohibited on /login, /settings, and /admin routes.'
            )}
          </p>
        </div>

        {/* 6. Administrative Audit Trail & Forensic Logging */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm">
          <h2 className="font-display text-xl font-bold uppercase mb-3 flex items-center gap-2 text-lime-hover">
            <Server className="w-5 h-5 text-lime-brand shrink-0" />
            <span>{t('৬. প্রশাসনিক অডিট লগ ও আইপি রেকর্ড', '6. Administrative Audit Log & IP Address')}</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            {t(
              'প্ল্যাটফর্মের নিরাপত্তা এবং অপব্যবহার রোধে অ্যাডমিন প্যানেলের সমস্ত সংবেদনশীল কার্যক্রম (যেমন ফুড বা ব্যায়াম এডিট, নোটিফিকেশন ব্রডকাস্ট, ব্যবহারকারী নিষ্ক্রিয়করণ) একটি অপরিবর্তনযোগ্য অডিট লগে সংরক্ষিত হয়। এই লগে অ্যাডমিনের ইমেইল, সম্পাদিত কাজের ধরন, সময় এবং আইপি অ্যাড্রেস নথিভুক্ত থাকে।',
              'To safeguard system integrity, all administrative actions (such as food database updates, broadcast announcements, and account security toggles) are recorded in an append-only audit trail containing the administrator email, action performed, timestamp, and remote IP address for forensic compliance.'
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {t(
              'গোপনীয়তা গ্যারান্টি: কোনো অ্যাডমিন সাধারণ ব্যবহারকারীর ব্যক্তিগত ডায়েট লগ, মিল হিস্ট্রি বা ব্যক্তিগত ওজন এন্ট্রি দেখতে পারেন না।',
              'Privacy Guarantee: Administrators are strictly barred from viewing individual users\' personal meal logs, dietary intake, or weight tracking history.'
            )}
          </p>
        </div>

        {/* 7. Data Retention & 30-Day Automated TTL */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm">
          <h2 className="font-display text-xl font-bold uppercase mb-3 flex items-center gap-2 text-pink-brand">
            <Clock className="w-5 h-5 shrink-0" />
            <span>{t('৭. ডেটা সংরক্ষণ নীতি (৩০ দিনের লগ টিটিএল)', '7. Data Retention & 30-Day Automated TTL')}</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t(
              'আমরা অতিরিক্ত অপ্রয়োজনীয় ডেটা ধারণ করি না। বিশদ দৈনিক মিল লগ এবং ওয়ার্কআউট ইনপুটগুলো ৩০ দিন পর স্বয়ংক্রিয়ভাবে ডেটাবেজ থেকে মুছে ফেলা হয় (30-day TTL expiry)। শুধুমাত্র আপনার সামগ্রিক স্ট্রিক সংখ্যা, ওজনের অগ্রগতি কার্ভ এবং প্রোফাইল অ্যাকাউন্ট অক্ষুণ্ণ রাখা হয়।',
              'We practice aggressive data minimization. Detailed granular meal entries and daily workout set logs are automatically purged after 30 days via MongoDB TTL policies. Only your aggregated active streak, high-level weight progress checkpoints, and profile preferences are retained indefinitely.'
            )}
          </p>
        </div>

        {/* 8. Immediate Account Deletion (Right to Erasure) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm">
          <h2 className="font-display text-xl font-bold uppercase mb-3 flex items-center gap-2 text-tomato-brand">
            <Trash2 className="w-5 h-5 shrink-0" />
            <span>{t('৮. সম্পূর্ণ অ্যাকাউন্ট ও ডেটা অপসারণ (Right to Erasure)', '8. Permanent Account Deletion (Right to Erasure)')}</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {t(
              'আপনার নিজের ডেটার ওপর আপনার সম্পূর্ণ নিয়ন্ত্রণ রয়েছে। সেটিংস পেজে "Delete My Account" বাটনে ক্লিক করলে একক অপারেশনে ডেটাবেজ থেকে আপনার ব্যবহারকারী প্রোফাইল, মিল লগ, ওয়ার্কআউট হিস্ট্রি, ওজন রেকর্ড, স্ট্রিক ডেটা, ফ্রেন্ড চ্যালেঞ্জ মেম্বারশিপ এবং পুশ টোকেন সম্পূর্ণ ও স্থায়ীভাবে ডিলিট হয়ে যায়।',
              'You maintain total ownership of your personal data. By clicking "Delete My Account" in your Settings, an automated cascading purge immediately and permanently wipes your user profile, meal logs, workout history, weight records, streak documents, friend challenge participation, and FCM push tokens from our primary database.'
            )}
          </p>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 text-xs font-bold text-tomato-brand hover:underline uppercase tracking-wider"
          >
            <span>{t('সেটিংস পেজে অ্যাকাউন্ট অপশন দেখুন →', 'Manage Account in Settings →')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
