'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Play, ShieldCheck, Film } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface YouTubeEmbedProps {
  youtubeId?: string;
  title: string;
}

export function YouTubeEmbed({ youtubeId, title }: YouTubeEmbedProps) {
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);

  if (!youtubeId || youtubeId.trim() === '') {
    return null;
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <div className="w-full rounded-3xl overflow-hidden border border-border bg-card shadow-sm">
      <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-tomato-base" />
          <h3 className="font-display font-bold text-lg text-foreground">
            {t('ভিডিও ডেমোন্স্ট্রেশন', 'Video Demonstration')}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-lime-brand" />
          <span>{t('গোপনীয়তাপ্রাপ্ত মোড (No-Cookie)', 'Privacy Mode (No-Cookie)')}</span>
        </div>
      </div>

      <div className="relative aspect-video w-full bg-ink-base">
        {isPlaying ? (
          <iframe
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        ) : (
          <div className="relative w-full h-full group cursor-pointer" onClick={() => setIsPlaying(true)}>
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
              sizes="(max-width: 768px) 100vw, 800px"
            />
            {/* Dark overlay for contrast */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

            {/* Play Button Facade */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-tomato-base text-white flex items-center justify-center shadow-xl transform group-hover:scale-110 group-active:scale-95 transition-transform duration-200">
                <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current translate-x-0.5" />
              </div>
              <span className="px-4 py-1.5 rounded-full bg-ink-base/80 text-white text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-sm border border-white/20">
                {t('ভিডিও দেখতে ক্লিক করুন', 'Click to Watch Video')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
