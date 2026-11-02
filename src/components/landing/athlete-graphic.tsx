'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Flame } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export function AthleteGraphic() {
  const { t } = useLanguage();

  return (
    <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-xl mx-auto flex items-center justify-center select-none">
      {/* Background Radial Aura Glow */}
      <div className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-tr from-lime-brand/25 via-pink-brand/15 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Main Stylized Hero Athlete Illustration Container */}
      <div className="relative w-full aspect-[4/5] max-h-[560px] rounded-3xl overflow-hidden border border-white/20 bg-gradient-to-b from-card/80 to-secondary/30 backdrop-blur-md shadow-2xl flex items-end justify-center">
        {/* Dynamic Background Angular Lines */}
        <div className="absolute inset-0 opacity-15 dark:opacity-25 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="500" x2="400" y2="0" stroke="currentColor" strokeWidth="1" strokeDasharray="6 6" />
            <line x1="100" y1="500" x2="400" y2="100" stroke="currentColor" strokeWidth="1" strokeDasharray="6 6" />
            <circle cx="200" cy="220" r="140" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 8" />
            <circle cx="200" cy="220" r="180" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          </svg>
        </div>

        {/* Center Athlete Silhouette with Rim Light */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-end pb-4">
          <svg
            className="w-[85%] max-w-[380px] drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)]"
            viewBox="0 0 320 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Ambient Lighting Gradient Defs */}
            <defs>
              <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1A211E" />
                <stop offset="50%" stopColor="#0F1412" />
                <stop offset="100%" stopColor="#1A211E" />
              </linearGradient>
              <linearGradient id="rimLight" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#A9F26B" />
                <stop offset="100%" stopColor="#FF2E88" />
              </linearGradient>
            </defs>

            {/* Stylized Muscular Athlete Torso & Arms */}
            {/* Head & Neck */}
            <path
              d="M160 50 C145 50 142 68 142 85 C142 105 150 115 160 115 C170 115 178 105 178 85 C178 68 175 50 160 50 Z"
              fill="url(#bodyGradient)"
              stroke="url(#rimLight)"
              strokeWidth="2.5"
            />
            {/* Traps */}
            <path
              d="M130 95 L142 85 L178 85 L190 95 L220 120 L100 120 Z"
              fill="url(#bodyGradient)"
              stroke="#A9F26B"
              strokeWidth="2"
            />
            {/* Shoulders & Arms */}
            {/* Left Deltoid & Bicep */}
            <path
              d="M100 120 C80 125 55 155 52 195 C50 235 70 270 85 275 L105 230 L115 160 Z"
              fill="url(#bodyGradient)"
              stroke="#A9F26B"
              strokeWidth="2.5"
            />
            {/* Right Deltoid & Bicep */}
            <path
              d="M220 120 C240 125 265 155 268 195 C270 235 250 270 235 275 L215 230 L205 160 Z"
              fill="url(#bodyGradient)"
              stroke="#FF2E88"
              strokeWidth="2.5"
            />
            {/* Forearms gripping barbell */}
            <path
              d="M85 275 L80 320 L110 320 L105 260 Z"
              fill="url(#bodyGradient)"
              stroke="#A9F26B"
              strokeWidth="2"
            />
            <path
              d="M235 275 L240 320 L210 320 L215 260 Z"
              fill="url(#bodyGradient)"
              stroke="#FF2E88"
              strokeWidth="2"
            />
            {/* Chest (Pecs) */}
            <path
              d="M115 140 C135 145 155 160 160 180 C165 160 185 145 205 140 C210 180 195 210 160 215 C125 210 110 180 115 140 Z"
              fill="url(#bodyGradient)"
              stroke="url(#rimLight)"
              strokeWidth="2.5"
            />
            {/* Abs & Core */}
            <path
              d="M135 215 L185 215 L180 330 L140 330 Z"
              fill="url(#bodyGradient)"
              stroke="rgba(169,242,107,0.5)"
              strokeWidth="2"
            />
            {/* Six pack lines */}
            <line x1="145" y1="240" x2="175" y2="240" stroke="#A9F26B" strokeWidth="1.5" strokeOpacity="0.8" />
            <line x1="145" y1="265" x2="175" y2="265" stroke="#A9F26B" strokeWidth="1.5" strokeOpacity="0.8" />
            <line x1="145" y1="290" x2="175" y2="290" stroke="#A9F26B" strokeWidth="1.5" strokeOpacity="0.8" />
            <line x1="160" y1="215" x2="160" y2="310" stroke="#A9F26B" strokeWidth="1.5" strokeOpacity="0.8" />

            {/* Olympic Curved EZ Barbell */}
            <path
              d="M10 295 L80 295 L110 310 L150 295 L170 295 L210 310 L240 295 L310 295"
              stroke="#FFFFFF"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Weight plates left */}
            <rect x="25" y="250" width="12" height="90" rx="3" fill="#A9F26B" stroke="#0F1412" strokeWidth="2" />
            <rect x="40" y="260" width="10" height="70" rx="2" fill="#8FE04F" stroke="#0F1412" strokeWidth="1.5" />
            {/* Weight plates right */}
            <rect x="283" y="250" width="12" height="90" rx="3" fill="#FF2E88" stroke="#0F1412" strokeWidth="2" />
            <rect x="270" y="260" width="10" height="70" rx="2" fill="#E5432A" stroke="#0F1412" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Floating Top Left Stat Badge */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-6 left-6 z-20 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl glass-panel border border-lime-brand/40 shadow-xl"
        >
          <div className="w-8 h-8 rounded-xl bg-lime-brand flex items-center justify-center text-ink-base shadow-sm">
            <Zap className="w-4 h-4 fill-ink-base" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {t('দৈনিক স্ট্রিক', 'Active Streak')}
            </span>
            <span className="font-display text-sm font-extrabold text-foreground">
              {t('২১ দিন পূর্ণ', '21 Days Active')}
            </span>
          </div>
        </motion.div>

        {/* Floating Bottom Right Badge */}
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute bottom-6 right-6 z-20 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl glass-panel border border-pink-brand/40 shadow-xl"
        >
          <div className="w-8 h-8 rounded-xl bg-pink-brand flex items-center justify-center text-white shadow-sm">
            <Flame className="w-4 h-4 fill-white" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {t('ওপেন সোর্স ডেটা', 'Verified Open')}
            </span>
            <span className="font-display text-sm font-extrabold text-foreground">
              {t('১০০% ফ্রি ডেটাবেজ', '100% Free Data')}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
