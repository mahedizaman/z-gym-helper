import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { ChallengeDetailClient } from '@/components/challenges/challenge-detail-client';
import { APP_CONFIG } from '@/config/app';

export async function generateStaticParams() {
  return [{ code: 'preview' }];
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `ফিটনেস ফ্রেন্ডস চ্যালেঞ্জ | ${APP_CONFIG.name}`,
    description: `বন্ধুদের সাথে প্রাইভেট ফিটনেস চ্যালেঞ্জে যোগ দিন।`,
  };
}

async function ChallengeDetailWrapper({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <ChallengeDetailClient code={code} />;
}

export default function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="container mx-auto p-8 animate-pulse" />}>
        <ChallengeDetailWrapper params={params} />
      </Suspense>
    </div>
  );
}
