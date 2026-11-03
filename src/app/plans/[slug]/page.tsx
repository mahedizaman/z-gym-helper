import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { WORKOUT_PLANS_DATA } from '@/server/seeds/plans.data';
import { PlanDetailClient } from '@/components/plans/plan-detail-client';
import { APP_CONFIG } from '@/config/app';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return WORKOUT_PLANS_DATA.map((plan) => ({
    slug: plan.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const plan = WORKOUT_PLANS_DATA.find((p) => p.slug === slug);

  if (!plan) {
    return {
      title: `ওয়ার্কআউট প্ল্যান পাওয়া যায়নি | ${APP_CONFIG.name}`,
    };
  }

  const title = `${plan.nameBn} - ওয়ার্কআউট রুটিন | ${APP_CONFIG.name}`;
  const description = `${plan.nameEn} - সপ্তাহে ${plan.daysPerWeek} দিনের সাইন্টিফিক ট্রেনিং স্প্লিট, সেটস, রেপস ও রেস্ট টাইমার।`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: APP_CONFIG.name,
      images: [
        {
          url: APP_CONFIG.ogImage,
          width: 1200,
          height: 630,
          alt: plan.nameEn,
        },
      ],
    },
  };
}

export default async function PlanDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const plan = WORKOUT_PLANS_DATA.find((p) => p.slug === slug);

  if (!plan) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background py-10 sm:py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <PlanDetailClient plan={plan} />
      </div>
    </div>
  );
}
