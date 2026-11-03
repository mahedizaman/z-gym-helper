import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { SettingsClient } from '@/components/settings/settings-client';
import { APP_CONFIG } from '@/config/app';

export const metadata: Metadata = {
  title: `প্রোফাইল ও সেটিংস | ${APP_CONFIG.name}`,
  description: 'শারীরিক তথ্য, ক্যালোরি লক্ষ্যমাত্রা এবং অ্যাকাউন্ট ডেটা সেটিংস।',
};

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="container mx-auto p-8 animate-pulse" />}>
        <SettingsClient />
      </Suspense>
    </div>
  );
}
