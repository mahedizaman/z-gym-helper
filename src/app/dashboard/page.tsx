import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { APP_CONFIG } from '@/config/app';

export const metadata: Metadata = {
  title: `ইউজার ড্যাশবোর্ড | ${APP_CONFIG.name}`,
  description: 'আপনার ফিটনেস ড্যাশবোর্ড, দৈনিক ক্যালোরি ব্যালেন্স, ওজন পরিবর্তন ও ওয়ার্কআউট ট্র্যাকিং।',
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="container mx-auto p-8 animate-pulse" />}>
        <ErrorBoundary sectionName="ড্যাশবোর্ড / Dashboard">
          <DashboardClient />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}
