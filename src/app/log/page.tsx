import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { LogClient } from '@/components/log/log-client';
import { APP_CONFIG } from '@/config/app';

export const metadata: Metadata = {
  title: `খাবার ও অ্যাক্টিভিটি লগ | ${APP_CONFIG.name}`,
  description: 'দৈনিক সকালের নাস্তা, দুপুরের খাবার, স্ন্যাক্স ও রাতের খাবারের পুষ্টি লগ করুন।',
};

export default function LogPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="container mx-auto p-8 animate-pulse" />}>
        <LogClient />
      </Suspense>
    </div>
  );
}
