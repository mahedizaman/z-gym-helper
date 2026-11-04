'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';
import { Wordmark } from '@/components/ui/wordmark';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85dvh] flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-md h-96 rounded-3xl border border-border bg-card p-8 animate-pulse" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}

function LoginFormContent() {
  const { t } = useLanguage();
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect to dashboard
  if (status === 'authenticated') {
    router.replace('/dashboard');
    return null;
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (err) {
      console.error('Sign-in error:', err);
      setIsLoading(false);
    }
  };

  // Structured bilingual friendly error descriptions (never show raw code)
  const getErrorMessage = (err: string | null) => {
    if (!err) return null;

    const lower = err.toLowerCase();
    if (lower.includes('accessdenied') || lower.includes('access_denied')) {
      return {
        titleBn: 'অ্যাক্সেস সীমাবদ্ধ / সাইন-ইন বাতিল',
        titleEn: 'Access Restricted / Sign-In Cancelled',
        descBn:
          'আপনি Google সাইন-ইন বাতিল করেছেন অথবা আপনার অ্যাকাউন্টটি অ্যাডমিন কর্তৃক সাময়িকভাবে নিষ্ক্রিয় রাখা হয়েছে। আপনি অতিথি (গেস্ট) হিসেবে সমস্ত ফিচার ব্যবহার করতে পারেন। কোনো ভুল মনে হলে যোগাযোগ করুন।',
        descEn:
          'You may have cancelled the sign-in request, or your account has been disabled by an administrator. You can freely use all features in Guest mode, or contact support if you need assistance.',
        showContactLink: true,
      };
    }

    if (
      lower.includes('configuration') ||
      lower.includes('invalid_client') ||
      lower.includes('client_id')
    ) {
      return {
        titleBn: 'Google সাইন-ইন সেবা প্রক্রিয়াধীন',
        titleEn: 'Google Sign-In Notice',
        descBn:
          'ওয়েবসাইটের Google OAuth আইডি কনফিগারেশন আপডেট করা হচ্ছে। কোনো অ্যাকাউন্ট ছাড়াই আপনি অতিথি মোডে অ্যাপের সমস্ত ফিচার অবিলম্বে ব্যবহার করতে পারেন।',
        descEn:
          'Google OAuth credentials are being updated by the administrator. You can continue using all calculators and food tracking seamlessly as a guest.',
        showContactLink: false,
      };
    }

    if (lower.includes('verification')) {
      return {
        titleBn: 'অনুরোধের সময় শেষ',
        titleEn: 'Verification Expired',
        descBn: 'সাইন-ইন যাচাইকরণের সময় অতিক্রান্ত হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
        descEn: 'The sign-in verification session has expired. Please try signing in again.',
        showContactLink: false,
      };
    }

    return {
      titleBn: 'সংযোগ সম্পন্ন করা যায়নি',
      titleEn: 'Unable to Complete Sign-In',
      descBn:
        'Google সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। অনুগ্রহ করে আপনার নেটওয়ার্ক চেক করে আবার চেষ্টা করুন অথবা গেস্ট মোডে চালিয়ে যান।',
      descEn:
        'Could not complete connection to Google services. Please verify your connection and try again, or continue as a guest.',
      showContactLink: true,
    };
  };

  const friendlyError = getErrorMessage(errorParam);

  return (
    <div className="min-h-[85dvh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-lime-brand/15 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Wordmark size="md" />
          </div>
          <h1 className="font-display font-black text-3xl uppercase tracking-tight text-foreground">
            {t('অ্যাকাউন্টে সাইন ইন করুন', 'Sign In to Your Account')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
            {t(
              'আপনার স্থানীয় গেস্ট ডেটা হারাবে না; লগইন করার সাথে সাথে তা নিরাপদে আপনার প্রোফাইলে মার্জ হয়ে যাবে।',
              'Your local guest data will be preserved and seamlessly merged into your profile upon sign-in.'
            )}
          </p>
        </div>

        {/* Friendly Error Banner if sign-in failed */}
        {friendlyError && (
          <div className="mb-6 p-4 rounded-2xl bg-tomato-brand/10 border border-tomato-brand/30 text-xs text-foreground space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 text-tomato-brand font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{t(friendlyError.titleBn, friendlyError.titleEn)}</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {t(friendlyError.descBn, friendlyError.descEn)}
            </p>
            <div className="pt-1 flex items-center gap-3">
              <Link
                href="/calculator"
                className="inline-flex items-center gap-1 font-bold text-lime-brand hover:underline"
              >
                <span>{t('গেস্ট মোডে চলুন', 'Continue as Guest')}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              {friendlyError.showContactLink && (
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>{t('যোগাযোগ', 'Support')}</span>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Benefits checklist */}
        <div className="space-y-2.5 mb-8 p-4 rounded-2xl bg-muted/40 border border-border/50 text-xs">
          <div className="flex items-center gap-2 text-foreground/90 font-medium">
            <CheckCircle2 className="w-4 h-4 text-lime-brand shrink-0" />
            <span>{t('ক্লাউড ব্যাকআপ ও একাধিক ডিভাইসে সিঙ্ক', 'Cloud backup & cross-device sync')}</span>
          </div>
          <div className="flex items-center gap-2 text-foreground/90 font-medium">
            <CheckCircle2 className="w-4 h-4 text-lime-brand shrink-0" />
            <span>{t('স্থায়ী ওজন ট্র্যাকিং ও প্রগ্রেস চার্ট', 'Permanent weight logs & visual progress charts')}</span>
          </div>
          <div className="flex items-center gap-2 text-foreground/90 font-medium">
            <CheckCircle2 className="w-4 h-4 text-lime-brand shrink-0" />
            <span>{t('ডেইলি স্ট্রিক ও ফিটনেস হিস্ট্রি সংরক্ষণ', 'Daily streak tracking & workout history')}</span>
          </div>
        </div>

        {/* Google Sign-in button (Strict Google OAuth only) */}
        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-full border border-border bg-white text-zinc-900 hover:bg-zinc-100 font-bold text-sm transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
          >
            {/* Google Multicolored SVG */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>
              {isLoading
                ? t('কানেক্ট হচ্ছে...', 'Connecting...')
                : t('Google অ্যাকাউন্ট দিয়ে প্রবেশ করুন', 'Continue with Google')}
            </span>
          </button>
        </div>

        {/* Security & Privacy note */}
        <div className="mt-8 pt-6 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-lime-brand" />
            <span>{t('সম্পূর্ণ নিরাপদ ও এনক্রিপ্টেড', 'Secure & Encrypted')}</span>
          </div>
          <Link href="/" className="hover:text-foreground font-semibold flex items-center gap-1">
            <span>{t('গেস্ট হিসেবে চলুন', 'Continue as guest')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
