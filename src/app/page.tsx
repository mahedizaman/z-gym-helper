'use client';

import React from 'react';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesGrid } from '@/components/landing/features-grid';
import { HowItWorks } from '@/components/landing/how-it-works';
import { FoodSearchDemo } from '@/components/landing/food-search-demo';
import { FAQSection } from '@/components/landing/faq-section';
import { FinalCTA } from '@/components/landing/final-cta';

export default function Home() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. 3 Benefits */}
      <FeaturesGrid />

      {/* 3. 3-Step How It Works */}
      <HowItWorks />

      {/* 4. Live Interactive Bangladeshi Food Search Demo */}
      <FoodSearchDemo />

      {/* 5. Frequently Asked Questions (FAQ) */}
      <FAQSection />

      {/* 6. Final High-Voltage CTA */}
      <FinalCTA />
    </div>
  );
}
