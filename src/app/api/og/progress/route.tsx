import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { APP_CONFIG } from '@/config/app';

/**
 * /api/og/progress
 *
 * NOTE: Satori does NOT support complex Indic/Bengali script shaping (HarfBuzz).
 * Therefore, this endpoint is strictly restricted to Latin/English text.
 * All Bengali cards are rasterized directly in the browser via client canvas / html-to-image.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const rawNickname = searchParams.get('nickname') || 'Athlete';
  // If nickname contains Bengali characters or fallback 'অ্যাথলিট', use 'Athlete' for Latin Satori rendering
  const isAllAscii = /^[\x20-\x7E]+$/.test(rawNickname);
  const nickname = isAllAscii && rawNickname.trim().length > 0 ? rawNickname.trim() : 'Athlete';

  const streak = searchParams.get('streak') || '0';
  const workouts = searchParams.get('workouts') || '0';
  const monthChange = searchParams.get('monthChange') || '0%';
  const showWeight = searchParams.get('showWeight') === 'true';
  const weight = searchParams.get('weight') || '';
  const format = searchParams.get('format') === 'story' ? 'story' : 'square';

  const width = 1080;
  const height = format === 'story' ? 1350 : 1080;

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
          fontFamily: 'sans-serif',
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
                {APP_CONFIG.name.toUpperCase()}
              </span>
              <span style={{ fontSize: '18px', color: '#8E959D', fontWeight: 600 }}>
                FITNESS & NUTRITION ASSISTANT
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
            PROGRESS REPORT
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
            ATHLETE PROFILE
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
              🔥 ACTIVE STREAK
            </span>
            <span
              style={{
                fontSize: '56px',
                fontWeight: 900,
                color: '#FF2E88',
                marginTop: '6px',
              }}
            >
              {streak} Days
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
              🏋️ WORKOUTS LOGGED
            </span>
            <span
              style={{
                fontSize: '56px',
                fontWeight: 900,
                color: '#A9F26B',
                marginTop: '6px',
              }}
            >
              {workouts} Sessions
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
              📉 30-DAY PROGRESS
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
              ⚖️ CURRENT WEIGHT
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
                {weight} kg
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
                🔒 Private (Hidden)
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
            Track workouts, nutrition & streak with {APP_CONFIG.name}
          </span>
          <span>Asia/Dhaka</span>
        </div>
      </div>
    ),
    {
      width,
      height,
    }
  );
}
