/**
 * Unified App Configuration for Z-Gym Helper
 *
 * All branding, metadata, names, and contact endpoints
 * MUST derive strictly from this file.
 */

export const APP_CONFIG = {
  name: 'Z-Gym Helper',
  shortName: 'Z-Gym',
  taglineBn: 'বাংলাদেশের জিম ও নিউট্রিশন প্ল্যাটফর্ম',
  taglineEn: 'Bangladesh\'s Premier Gym & Nutrition Platform',
  descriptionBn:
    'বাংলাদেশী খাবারের পুষ্টি পরিমাপ, ব্যক্তিগত ওয়ার্কআউট প্ল্যান, ক্যালোরি ট্র্যাকিং ও ফিটনেস স্ট্রিক — সবকিছু এক ছাদের নিচে সম্পূর্ণ ফ্রিতে।',
  descriptionEn:
    'Bangladeshi food nutrition calculator, personalized workout splits, calorie tracking, and fitness streaks — all in one place, free forever.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://zgym.app',
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
    { href: '/', labelBn: 'হোম', labelEn: 'Home' },
    { href: '/foods', labelBn: 'খাদ্য তালিকা', labelEn: 'Food Database' },
    { href: '/calculator', labelBn: 'ক্যালকুলেটর', labelEn: 'Calculators' },
    { href: '/plans', labelBn: 'ওয়ার্কআউট প্ল্যান', labelEn: 'Workout Plans' },
    { href: '/exercises', labelBn: 'ব্যায়াম লাইব্রেরি', labelEn: 'Exercises' },
    { href: '/leaderboard', labelBn: 'লিডারবোর্ড', labelEn: 'Leaderboard' },
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
