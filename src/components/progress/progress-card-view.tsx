'use client';

import React from 'react';
import { toBengaliDigits } from '@/lib/bengali-digits';
import { APP_CONFIG } from '@/config/app';

export interface ProgressCardViewProps {
  nickname: string;
  streak: number;
  workouts: number;
  monthChange?: string;
  weightKg?: number | null;
  showWeight?: boolean;
  format?: 'square' | 'story';
  lang?: 'bn' | 'en';
}

export const ProgressCardView = React.forwardRef<HTMLDivElement, ProgressCardViewProps>(
  function ProgressCardView(
    {
      nickname,
      streak,
      workouts,
      monthChange = '0%',
      weightKg = null,
      showWeight = false,
      format = 'square',
      lang = 'bn',
    },
    ref
  ) {
    const isBn = lang === 'bn';
    const isStory = format === 'story';

    const width = 1080;
    const height = isStory ? 1350 : 1080;

    const streakDisplay = isBn ? `${toBengaliDigits(streak)} দিন` : `${streak} Days`;
    const workoutsDisplay = isBn ? `${toBengaliDigits(workouts)} সেশন` : `${workouts} Sessions`;
    const monthChangeDisplay = isBn ? toBengaliDigits(monthChange) : monthChange;

    const weightDisplay =
      showWeight && weightKg
        ? isBn
          ? `${toBengaliDigits(weightKg)} কেজি`
          : `${weightKg} kg`
        : isBn
        ? '🔒 ব্যক্তিগত (লুকানো)'
        : '🔒 Private (Hidden)';

    return (
      <div
        ref={ref}
        data-testid="progress-card-view"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          minWidth: `${width}px`,
          minHeight: `${height}px`,
          maxWidth: `${width}px`,
          maxHeight: `${height}px`,
          backgroundColor: '#0F1412',
          backgroundImage:
            'radial-gradient(circle at 85% 15%, rgba(169, 242, 107, 0.18) 0%, transparent 45%), radial-gradient(circle at 15% 85%, rgba(255, 46, 136, 0.18) 0%, transparent 45%)',
          padding: isStory ? '90px 75px' : '75px 75px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-hind), "Hind Siliguri", "Noto Sans Bengali", system-ui, -apple-system, sans-serif',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          textRendering: 'optimizeLegibility',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
      >
        {/* Header: Brand Wordmark & Progress Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid rgba(255, 255, 255, 0.12)',
            paddingBottom: '36px',
          }}
        >
          {/* Logo & Tagline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '68px',
                height: '68px',
                borderRadius: '22px',
                backgroundColor: '#A9F26B',
                color: '#0F1412',
                fontSize: '38px',
                fontWeight: 900,
                boxShadow: '0 8px 24px rgba(169, 242, 107, 0.25)',
              }}
            >
              ⚡
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '40px',
                  fontWeight: 900,
                  letterSpacing: '-0.5px',
                  fontFamily: 'var(--font-saira), "Saira Condensed", sans-serif',
                  color: '#FFFFFF',
                  lineHeight: 1.1,
                }}
              >
                {APP_CONFIG.name.toUpperCase()}
              </span>
              <span
                style={{
                  fontSize: '18px',
                  color: '#8E959D',
                  fontWeight: 600,
                  marginTop: '4px',
                  letterSpacing: '0.5px',
                }}
              >
                {isBn ? 'ফিটনেস ও নিউট্রিশন অ্যাসিস্ট্যান্ট' : 'FITNESS & NUTRITION ASSISTANT'}
              </span>
            </div>
          </div>

          {/* Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(169, 242, 107, 0.14)',
              border: '2px solid #A9F26B',
              borderRadius: '9999px',
              padding: '12px 28px',
              color: '#A9F26B',
              fontSize: '22px',
              fontWeight: 800,
              letterSpacing: '1px',
              boxShadow: '0 4px 16px rgba(169, 242, 107, 0.15)',
            }}
          >
            <span>{isBn ? 'অগ্রগতি রিপোর্ট' : 'PROGRESS REPORT'}</span>
          </div>
        </div>

        {/* User Hero Section */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            margin: isStory ? '48px 0' : '24px 0',
          }}
        >
          <span
            style={{
              fontSize: '22px',
              color: '#8E959D',
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '10px',
            }}
          >
            {isBn ? 'অ্যাথলিট প্রোফাইল' : 'ATHLETE PROFILE'}
          </span>
          <div
            style={{
              fontSize: isStory ? '72px' : '62px',
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '-1px',
              lineHeight: 1.15,
              wordBreak: 'break-word',
            }}
          >
            <span>{nickname}</span>
          </div>
        </div>

        {/* 4 Stat Metric Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '24px',
            width: '100%',
          }}
        >
          {/* 1. Streak Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              backgroundColor: '#1A211E',
              borderRadius: '32px',
              padding: '38px',
              border: '2px solid rgba(255, 46, 136, 0.45)',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3)',
            }}
          >
            <span
              style={{
                fontSize: '22px',
                color: '#FFD6E8',
                fontWeight: 700,
                letterSpacing: '0.5px',
              }}
            >
              {isBn ? '🔥 সক্রিয় স্ট্রিক' : '🔥 ACTIVE STREAK'}
            </span>
            <span
              style={{
                fontSize: '60px',
                fontWeight: 900,
                color: '#FF2E88',
                marginTop: '8px',
                lineHeight: 1.1,
              }}
            >
              {streakDisplay}
            </span>
          </div>

          {/* 2. Workouts Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              backgroundColor: '#1A211E',
              borderRadius: '32px',
              padding: '38px',
              border: '2px solid rgba(169, 242, 107, 0.45)',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3)',
            }}
          >
            <span
              style={{
                fontSize: '22px',
                color: '#E4FBCB',
                fontWeight: 700,
                letterSpacing: '0.5px',
              }}
            >
              {isBn ? '🏋️ ওয়ার্কআউট সম্পন্ন' : '🏋️ WORKOUTS LOGGED'}
            </span>
            <span
              style={{
                fontSize: '60px',
                fontWeight: 900,
                color: '#A9F26B',
                marginTop: '8px',
                lineHeight: 1.1,
              }}
            >
              {workoutsDisplay}
            </span>
          </div>

          {/* 3. Monthly Change Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              backgroundColor: '#1A211E',
              borderRadius: '32px',
              padding: '38px',
              border: '2px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3)',
            }}
          >
            <span
              style={{
                fontSize: '22px',
                color: '#8E959D',
                fontWeight: 700,
                letterSpacing: '0.5px',
              }}
            >
              {isBn ? '📉 ৩০ দিনের অগ্রগতি' : '📉 30-DAY PROGRESS'}
            </span>
            <span
              style={{
                fontSize: '60px',
                fontWeight: 900,
                color: '#FFFFFF',
                marginTop: '8px',
                lineHeight: 1.1,
              }}
            >
              {monthChangeDisplay}
            </span>
          </div>

          {/* 4. Weight Status Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              backgroundColor: '#1A211E',
              borderRadius: '32px',
              padding: '38px',
              border: '2px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3)',
            }}
          >
            <span
              style={{
                fontSize: '22px',
                color: '#8E959D',
                fontWeight: 700,
                letterSpacing: '0.5px',
              }}
            >
              {isBn ? '⚖️ বর্তমান ওজন' : '⚖️ CURRENT WEIGHT'}
            </span>
            <span
              style={{
                fontSize: showWeight && weightKg ? '60px' : '36px',
                fontWeight: showWeight && weightKg ? 900 : 800,
                color: showWeight && weightKg ? '#FFFFFF' : '#8E959D',
                marginTop: showWeight && weightKg ? '8px' : '16px',
                lineHeight: 1.1,
              }}
            >
              {weightDisplay}
            </span>
          </div>
        </div>

        {/* Footer Note */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '2px solid rgba(255, 255, 255, 0.12)',
            paddingTop: '28px',
            color: '#8E959D',
            fontSize: '20px',
            fontWeight: 600,
          }}
        >
          <span>
            {isBn
              ? `ওয়ার্কআউট, পুষ্টি ও স্ট্রিক ট্র্যাক করুন ${APP_CONFIG.shortName} এ`
              : `Track workouts, nutrition & streak with ${APP_CONFIG.name}`}
          </span>
          <span style={{ fontWeight: 700 }}>Asia/Dhaka</span>
        </div>
      </div>
    );
  }
);
