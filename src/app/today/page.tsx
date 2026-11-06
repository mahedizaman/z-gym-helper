import { Suspense } from 'react';
import { Metadata } from 'next';
import { TodayClient } from '@/components/today/today-client';
import { APP_CONFIG } from '@/config/app';

export const metadata: Metadata = {
  title: `আজকের লক্ষ্য ও পুষ্টি | ${APP_CONFIG.shortName}`,
  description: 'দৈনিক ক্যালোরি লক্ষ্য, খাবারের পুষ্টিমান এবং ব্যায়ামের অগ্রগতি এক নজরে ট্র্যাক করুন।',
};

export default function TodayPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-8 animate-pulse text-center">Loading...</div>}>
      <TodayClient />
    </Suspense>
  );
}
