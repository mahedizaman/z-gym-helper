import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { APP_CONFIG } from '@/config/app';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const nickname = searchParams.get('nickname') || 'অ্যাথলিট';
  const streak = searchParams.get('streak') || '0';
  const workouts = searchParams.get('workouts') || '0';
  const monthChange = searchParams.get('monthChange') || '0%';
  const showWeight = searchParams.get('showWeight') === 'true';
  const weight = searchParams.get('weight') || '';
  const format = searchParams.get('format') === 'story' ? 'story' : 'square';
  const lang = searchParams.get('lang') || 'bn';

  const width = 1080;
  const height = format === 'story' ? 1350 : 1080;

  // Load Bengali TrueType Font for Satori rendering
  const fontPath = path.join(process.cwd(), 'public/fonts/NotoSansBengali-Bold.ttf');
  const fontData = fs.readFileSync(fontPath);

  const isBn = lang !== 'en';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0F1412',
          backgroundImage:
            'radial-gradient(circle at 85% 15%, rgba(169, 242, 107, 0.15) 0%, transparent 40%), radial-gradient(circle at 15% 85%, rgba(255, 46, 136, 0.15) 0%, transparent 40%)',
          padding: format === 'story' ? '90px 70px' : '70px 70px',
          fontFamily: '"Noto Sans Bengali", sans-serif',
          color: '#FFFFFF',
        }}
      >
        {/* Header Brand Wordmark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
            paddingBottom: '36px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                backgroundColor: '#A9F26B',
                color: '#0F1412',
                fontSize: '36px',
                fontWeight: 900,
              }}
            >
              ⚡
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '36px',
                  fontWeight: 900,
                  letterSpacing: '-1px',
                  color: '#FFFFFF',
                }}
              >
                Z-GYM HELPER
              </span>
              <span style={{ fontSize: '18px', color: '#8E959D', fontWeight: 600 }}>
                {isBn ? 'ফিটনেস ও নিউট্রিশন অ্যাসিস্ট্যান্ট' : 'FITNESS & NUTRITION ASSISTANT'}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(169, 242, 107, 0.12)',
              border: '1.5px solid #A9F26B',
              borderRadius: '9999px',
              padding: '10px 24px',
              color: '#A9F26B',
              fontSize: '20px',
              fontWeight: 800,
              letterSpacing: '1px',
            }}
          >
            {isBn ? 'অগ্রগতি রিপোর্ট' : 'PROGRESS REPORT'}
          </div>
        </div>

        {/* User Hero Section */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            margin: format === 'story' ? '40px 0' : '20px 0',
          }}
        >
          <span
            style={{
              fontSize: '22px',
              color: '#8E959D',
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            {isBn ? 'অ্যাথলিট প্রোফাইল' : 'ATHLETE PROFILE'}
          </span>
          <div
            style={{
              fontSize: format === 'story' ? '68px' : '58px',
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '-1px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <span>{nickname}</span>
          </div>
        </div>

        {/* 4 Stat Metric Cards Grid */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '24px',
            justifyContent: 'space-between',
          }}
        >
          {/* Streak Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              width: '450px',
              backgroundColor: '#1A211E',
              borderRadius: '32px',
              padding: '36px',
              border: '1.5px solid rgba(255, 46, 136, 0.4)',
            }}
          >
            <span style={{ fontSize: '20px', color: '#FFD6E8', fontWeight: 700 }}>
              {isBn ? '🔥 সক্রিয় স্ট্রিক' : '🔥 ACTIVE STREAK'}
            </span>
            <span
              style={{
                fontSize: '56px',
                fontWeight: 900,
                color: '#FF2E88',
                marginTop: '6px',
              }}
            >
              {streak} {isBn ? 'দিন' : 'Days'}
            </span>
          </div>

          {/* Workouts Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              width: '450px',
              backgroundColor: '#1A211E',
              borderRadius: '32px',
              padding: '36px',
              border: '1.5px solid rgba(169, 242, 107, 0.4)',
            }}
          >
            <span style={{ fontSize: '20px', color: '#E4FBCB', fontWeight: 700 }}>
              {isBn ? '🏋️ ওয়ার্কআউট সম্পন্ন' : '🏋️ WORKOUTS LOGGED'}
            </span>
            <span
              style={{
                fontSize: '56px',
                fontWeight: 900,
                color: '#A9F26B',
                marginTop: '6px',
              }}
            >
              {workouts} {isBn ? 'সেশন' : 'Sessions'}
            </span>
          </div>

          {/* Monthly Change Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              width: '450px',
              backgroundColor: '#1A211E',
              borderRadius: '32px',
              padding: '36px',
              border: '1.5px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <span style={{ fontSize: '20px', color: '#8E959D', fontWeight: 700 }}>
              {isBn ? '📉 ৩০ দিনের অগ্রগতি' : '📉 30-DAY PROGRESS'}
            </span>
            <span
              style={{
                fontSize: '56px',
                fontWeight: 900,
                color: '#FFFFFF',
                marginTop: '6px',
              }}
            >
              {monthChange}
            </span>
          </div>

          {/* Weight Status Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              width: '450px',
              backgroundColor: '#1A211E',
              borderRadius: '32px',
              padding: '36px',
              border: '1.5px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <span style={{ fontSize: '20px', color: '#8E959D', fontWeight: 700 }}>
              {isBn ? '⚖️ বর্তমান ওজন' : '⚖️ CURRENT WEIGHT'}
            </span>
            {showWeight && weight ? (
              <span
                style={{
                  fontSize: '56px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  marginTop: '6px',
                }}
              >
                {weight} {isBn ? 'কেজি' : 'kg'}
              </span>
            ) : (
              <span
                style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  color: '#8E959D',
                  marginTop: '16px',
                }}
              >
                {isBn ? '🔒 ব্যক্তিগত (লুকানো)' : '🔒 Private (Hidden)'}
              </span>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '2px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '28px',
            color: '#8E959D',
            fontSize: '18px',
            fontWeight: 600,
          }}
        >
          <span>
            {isBn
              ? `ওয়ার্কআউট, পুষ্টি ও স্ট্রিক ট্র্যাক করুন ${APP_CONFIG.shortName} এ`
              : `Track workouts, nutrition & streak with ${APP_CONFIG.name}`}
          </span>
          <span>Asia/Dhaka</span>
        </div>
      </div>
    ),
    {
      width,
      height,
      fonts: [
        {
          name: 'Noto Sans Bengali',
          data: fontData,
          weight: 700,
          style: 'normal',
        },
      ],
    }
  );
}
