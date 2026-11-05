import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { exerciseService } from '@/server/services/exercise.service';
import { CORE_EXERCISES_DATA } from '@/server/seeds/exercises.data';
import { getExerciseImages } from '@/server/seeds/exercise-images.data';
import { ExerciseDetailClient } from '@/components/exercise/exercise-detail-client';
import { APP_CONFIG } from '@/config/app';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return CORE_EXERCISES_DATA.map((exercise) => ({
    slug: exercise.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const exercise =
    (await exerciseService.getExerciseBySlug(slug)) ||
    CORE_EXERCISES_DATA.find((e) => e.slug === slug);

  if (!exercise) {
    return {
      title: `ব্যায়াম পাওয়া যায়নি | ${APP_CONFIG.name}`,
    };
  }

  const title = `${exercise.nameBn} (${exercise.nameEn}) - ব্যায়াম গাইড | ${APP_CONFIG.name}`;
  const description = `${exercise.nameEn} ফর্ম গাইড, ধাপসমূহ, সাধারণ ভুল এবং ভিডিও ডেমো। পেশি গ্রুপ: ${exercise.muscle}।`;

  return {
    title,
    description,
    alternates: {
      canonical: `${APP_CONFIG.url}/exercises/${exercise.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${APP_CONFIG.url}/exercises/${exercise.slug}`,
      siteName: APP_CONFIG.name,
      images: [
        {
          url: getExerciseImages(exercise.slug)[0] || APP_CONFIG.ogImage,
          width: 800,
          height: 600,
          alt: exercise.nameEn,
        },
      ],
    },
  };
}

async function ExerciseDetailContent({ params }: PageProps) {
  const { slug } = await params;
  const exercise =
    (await exerciseService.getExerciseBySlug(slug)) ||
    CORE_EXERCISES_DATA.find((e) => e.slug === slug);

  if (!exercise) {
    notFound();
  }

  const exerciseWithImages = {
    ...exercise,
    images: getExerciseImages(exercise.slug),
  };

  return <ExerciseDetailClient exercise={exerciseWithImages} />;
}

export default function ExerciseDetailPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-background py-10 sm:py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <Suspense
          fallback={
            <div className="h-96 rounded-3xl bg-card animate-pulse border border-border" />
          }
        >
          <ExerciseDetailContent params={params} />
        </Suspense>
      </div>
    </div>
  );
}
