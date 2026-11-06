/**
 * Unified App Configuration for Z-Gym Helper
 *
 * All branding, metadata, names, and contact endpoints
 * MUST derive strictly from this file.
 */

/**
 * Resolves the canonical app URL strictly from NEXT_PUBLIC_APP_URL.
 * In production, it never falls back to an unowned domain (throws loudly).
 * In development or testing, it safely defaults to localhost.
 */
export function resolveAppUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }

  // In production builds and runtime, NEVER fall back to an unowned domain.
  if (process.env.NODE_ENV === 'production') {
    const errorMsg =
      '\n====================================================================\n' +
      '❌ FATAL CONFIGURATION ERROR: NEXT_PUBLIC_APP_URL is missing in production!\n' +
      'og:url and canonical URLs must come strictly from NEXT_PUBLIC_APP_URL.\n' +
      'Falling back to an unowned domain (such as zgym.app) is strictly prohibited.\n' +
      'Please set NEXT_PUBLIC_APP_URL in your environment variables.\n' +
      '====================================================================\n';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Development and test loopback fallback
  return 'http://localhost:3000';
}

export const APP_CONFIG = {
  name: 'Z-Gym Helper',
  shortName: 'Z-Gym',
  taglineBn: 'বাংলাদেশের জিম ও নিউট্রিশন প্ল্যাটফর্ম',
  taglineEn: 'Bangladesh\'s Premier Gym & Nutrition Platform',
  descriptionBn:
    'বাংলাদেশী খাবারের পুষ্টি পরিমাপ, ব্যক্তিগত ওয়ার্কআউট প্ল্যান, ক্যালোরি ট্র্যাকিং ও ফিটনেস স্ট্রিক — সবকিছু এক ছাদের নিচে সহজে ব্যবহার উপযোগী।',
  descriptionEn:
    'Bangladeshi food nutrition calculator, personalized workout splits, calorie tracking, and fitness streaks — all in one place, free to use.',
  url: resolveAppUrl(),
  ogImage: '/images/og-preview.png',
  locale: 'bn-BD',
  supportedLocales: ['bn', 'en'] as const,
  defaultLocale: 'bn' as const,
  timezone: 'Asia/Dhaka',
  calorieFloor: {
    male: 1500,
    female: 1200,
  },
  kcalPerKgFat: 7700,
  navLinks: [
    { href: '/today', labelBn: 'আজ', labelEn: 'Today' },
    { href: '/foods', labelBn: 'খাবার', labelEn: 'Foods' },
    { href: '/exercises', labelBn: 'ব্যায়াম', labelEn: 'Workouts' },
    { href: '/progress', labelBn: 'অগ্রগতি', labelEn: 'Progress' },
  ],
  moreLinks: [
    { href: '/leaderboard', labelBn: 'লিডারবোর্ড', labelEn: 'Leaderboard' },
    { href: '/challenges', labelBn: 'চ্যালেঞ্জ', labelEn: 'Challenges' },
    { href: '/calculator', labelBn: 'বিএমআই ও ক্যালকুলেটর', labelEn: 'BMI & Calculator' },
    { href: '/plans', labelBn: 'প্ল্যান লাইব্রেরি', labelEn: 'Plan Library' },
    { href: '/settings', labelBn: 'সেটিংস', labelEn: 'Settings' },
    { href: '/about', labelBn: 'আমাদের সম্পর্কে', labelEn: 'About Us' },
    { href: '/privacy', labelBn: 'গোপনীয়তা নীতি', labelEn: 'Privacy Policy' },
    { href: '/terms', labelBn: 'শর্তাবলী', labelEn: 'Terms of Service' },
    { href: '/contact', labelBn: 'যোগাযোগ', labelEn: 'Contact' },
  ],
  appLinks: [
    { href: '/dashboard', labelBn: 'ড্যাশবোর্ড', labelEn: 'Dashboard' },
    { href: '/log', labelBn: 'লগ করুন', labelEn: 'Log Activity' },
    { href: '/progress', labelBn: 'অগ্রগতি', labelEn: 'Progress' },
    { href: '/challenges', labelBn: 'চ্যালেঞ্জ', labelEn: 'Challenges' },
    { href: '/settings', labelBn: 'সেটিংস', labelEn: 'Settings' },
  ],
  footerLinks: [
    { href: '/about', labelBn: 'আমাদের সম্পর্কে', labelEn: 'About Us' },
    { href: '/contact', labelBn: 'যোগাযোগ', labelEn: 'Contact' },
    { href: '/privacy', labelBn: 'গোপনীয়তা নীতি', labelEn: 'Privacy Policy' },
    { href: '/terms', labelBn: 'শর্তাবলী', labelEn: 'Terms of Service' },
  ],
  socials: {
    facebook: 'https://facebook.com',
    youtube: 'https://youtube.com',
    instagram: 'https://instagram.com',
  },
} as const;

export type Locale = (typeof APP_CONFIG.supportedLocales)[number];
