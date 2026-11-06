import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProgressCardView } from './progress-card-view';
import { toBengaliDigits } from '@/lib/bengali-digits';

describe('ProgressCardView Bengali & English Rendering', () => {
  it('converts Latin digits to Bengali digits accurately', () => {
    expect(toBengaliDigits(0)).toBe('০');
    expect(toBengaliDigits(7)).toBe('৭');
    expect(toBengaliDigits(12)).toBe('১২');
    expect(toBengaliDigits('30 Days')).toBe('৩০ Days');
    expect(toBengaliDigits('-2.5%')).toBe('-২.৫%');
  });

  it('renders all required Bangla strings accurately without Satori corruption', () => {
    const html = renderToStaticMarkup(
      <ProgressCardView
        nickname="তানভীর"
        streak={5}
        workouts={12}
        monthChange="-2.5%"
        showWeight={false}
        weightKg={70}
        format="story"
        lang="bn"
      />
    );

    // Required Bangla phrases explicitly mandated by the user
    expect(html).toContain('সক্রিয় স্ট্রিক');
    expect(html).toContain('ওয়ার্কআউট সম্পন্ন');
    expect(html).toContain('অগ্রগতি রিপোর্ট');

    // Additional Bangla metadata and labels
    expect(html).toContain('ফিটনেস ও নিউট্রিশন অ্যাসিস্ট্যান্ট');
    expect(html).toContain('অ্যাথলিট প্রোফাইল');
    expect(html).toContain('তানভীর');
    expect(html).toContain('৩০ দিনের অগ্রগতি');

    // Bengali numbers
    expect(html).toContain('৫ দিন');
    expect(html).toContain('১২ সেশন');
    expect(html).toContain('-২.৫%');

    // Weight must be hidden by default
    expect(html).toContain('🔒 ব্যক্তিগত (লুকানো)');
    expect(html).not.toContain('৭০ কেজি');

    // Dimensions for story format (1080x1350)
    expect(html).toContain('width:1080px');
    expect(html).toContain('height:1350px');
  });

  it('reveals weight with Bengali digits only when user explicitly opts in', () => {
    const html = renderToStaticMarkup(
      <ProgressCardView
        nickname="অ্যাথলিট"
        streak={1}
        workouts={1}
        monthChange="0%"
        showWeight={true}
        weightKg={72.5}
        format="square"
        lang="bn"
      />
    );

    // Shows weight in kg with Bengali digits
    expect(html).toContain('৭২.৫ কেজি');
    expect(html).not.toContain('🔒 ব্যক্তিগত (লুকানো)');

    // 1:1 Square dimensions (1080x1080)
    expect(html).toContain('width:1080px');
    expect(html).toContain('height:1080px');
  });

  it('renders clean English labels and formatting when lang="en"', () => {
    const html = renderToStaticMarkup(
      <ProgressCardView
        nickname="Tanvir"
        streak={7}
        workouts={15}
        monthChange="-1.5%"
        showWeight={false}
        weightKg={75}
        format="square"
        lang="en"
      />
    );

    expect(html).toContain('PROGRESS REPORT');
    expect(html).toContain('ACTIVE STREAK');
    expect(html).toContain('WORKOUTS LOGGED');
    expect(html).toContain('30-DAY PROGRESS');
    expect(html).toContain('7 Days');
    expect(html).toContain('15 Sessions');
    expect(html).toContain('🔒 Private (Hidden)');
  });
});
