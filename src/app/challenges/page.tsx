import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { ChallengesClient } from '@/components/challenges/challenges-client';
import { APP_CONFIG } from '@/config/app';

export const metadata: Metadata = {
  title: `ফ্রেন্ডস ফিটনেস চ্যালেঞ্জ গ্রুপ | ${APP_CONFIG.name}`,
  description: '২ থেকে ১০ জন বন্ধুর সাথে প্রাইভেট কোড দিয়ে ৭, ১৪ বা ৩০ দিনের ফিটনেস প্রতিযোগিতা।',
};

export default function ChallengesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="container mx-auto p-8 animate-pulse" />}>
        <ChallengesClient />
      </Suspense>
    </div>
  );
}
