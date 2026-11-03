import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { ProgressClient } from '@/components/progress/progress-client';
import { APP_CONFIG } from '@/config/app';

export const metadata: Metadata = {
  title: `ওজন ও অগ্রগতি ট্র্যাকিং | ${APP_CONFIG.name}`,
  description: 'আপনার ওজন পরিবর্তনের চার্ট, মাসিক ব্যবধান এবং স্থায়ী ফিটনেস ইতিহাস।',
};

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="container mx-auto p-8 animate-pulse" />}>
        <ProgressClient />
      </Suspense>
    </div>
  );
}
