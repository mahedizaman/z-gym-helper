import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { LeaderboardClient } from '@/components/leaderboard/leaderboard-client';
import { APP_CONFIG } from '@/config/app';

export const metadata: Metadata = {
  title: `কমিউনিটি লিডারবোর্ড ও স্ট্রিক র‍্যাঙ্কিং | ${APP_CONFIG.name}`,
  description: 'প্রাইভেসি-সুরক্ষিত অপ্ট-ইন লিডারবোর্ড। স্ট্রিক ও প্রগ্রেস পার্সেন্টেজ র‍্যাঙ্কিং।',
};

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="container mx-auto p-8 animate-pulse" />}>
        <LeaderboardClient />
      </Suspense>
    </div>
  );
}
