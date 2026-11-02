'use client';

import React from 'react';
import { HeroSection } from '@/components/landing/hero-section';
import { MarqueeRibbon } from '@/components/landing/marquee-ribbon';
import { FeaturesGrid } from '@/components/landing/features-grid';
import { HowItWorks } from '@/components/landing/how-it-works';
import { FoodSearchDemo } from '@/components/landing/food-search-demo';
import { CalculatorTeaser } from '@/components/landing/calculator-teaser';
import { WorkoutPlanChooser } from '@/components/landing/workout-plan-chooser';
import { ExerciseTeaser } from '@/components/landing/exercise-teaser';
import { StreakChallengeTeaser } from '@/components/landing/streak-challenge-teaser';
import { FAQSection } from '@/components/landing/faq-section';
import { FinalCTA } from '@/components/landing/final-cta';

export default function Home() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* 1. Hero Section with GSAP Intro Timeline & Video Facade Modal */}
      <HeroSection />

      {/* 2. Marquee Ribbon Strip with Real Platform Stats */}
      <MarqueeRibbon />

      {/* 3. Features Grid with Staggered Visual Cards */}
      <FeaturesGrid />

      {/* 4. How It Works (Pinned Horizontal Scroll on Desktop, Stack on Mobile) */}
      <HowItWorks />

      {/* 5. Live Interactive Bangladeshi Food Search Demo */}
      <FoodSearchDemo />

      {/* 6. Scientific Calculators Teaser (BMI & BMR/TDEE) */}
      <CalculatorTeaser />

      {/* 7. Workout Plan Chooser (Pricing-Style 3, 4, 5, 6 Day Splits) */}
      <WorkoutPlanChooser />

      {/* 8. Core Exercise Guide & Form Library Teaser */}
      <ExerciseTeaser />

      {/* 9. Streak & Friend Challenge Teaser with 1080x1350 Social Card */}
      <StreakChallengeTeaser />

      {/* 10. Frequently Asked Questions (FAQ) Accordion */}
      <FAQSection />

      {/* 11. Final High-Voltage CTA Banner */}
      <FinalCTA />
    </div>
  );
}
