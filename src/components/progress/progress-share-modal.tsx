'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { X, Share2, Download, MessageCircle, Eye, EyeOff, Sparkles } from 'lucide-react';
import Image from 'next/image';

interface ProgressShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  nickname: string;
  streak: number;
  workouts: number;
  monthChange: string;
  weightKg?: number | null;
}

export function ProgressShareModal({
  isOpen,
  onClose,
  nickname,
  streak,
  workouts,
  monthChange,
  weightKg,
}: ProgressShareModalProps) {
  const { t } = useLanguage();
  const [format, setFormat] = useState<'square' | 'story'>('square');
  const [showWeight, setShowWeight] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const weightParam = weightKg ? String(weightKg) : '';
  const ogImageUrl = `/api/og/progress?nickname=${encodeURIComponent(
    nickname
  )}&streak=${streak}&workouts=${workouts}&monthChange=${encodeURIComponent(
    monthChange
  )}&showWeight=${showWeight}&weight=${encodeURIComponent(weightParam)}&format=${format}`;

  const shareText = `🔥 আমার Z-Gym Helper ফিটনেস প্রগ্রেস: ${streak} দিনের স্ট্রিক এবং ${workouts}টি ওয়ার্কআউট সম্পন্ন! আপনিও যোগ দিন: ${window.location.origin}`;

  const handleWebShare = async () => {
    try {
      setSharing(true);
      // Fetch the generated OG image blob
      const res = await fetch(ogImageUrl);
      const blob = await res.blob();
      const file = new File([blob], `zgym-progress-${nickname}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${nickname} - Z-Gym Progress`,
          text: shareText,
        });
      } else if (navigator.share) {
        await navigator.share({
          title: `${nickname} - Z-Gym Progress`,
          text: shareText,
          url: window.location.origin,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
    } finally {
      setSharing(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const res = await fetch(ogImageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zgym-progress-${nickname}-${format}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      shareText + ' ' + window.location.origin
    )}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-base/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-lime-brand" />
            <h3 className="font-display font-black text-xl uppercase tracking-tight text-foreground">
              {t('প্রগ্রেস কার্ড শেয়ার করুন', 'Share Progress Card')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Preview */}
        <div className="rounded-2xl overflow-hidden border border-border bg-ink-base relative aspect-square max-w-[340px] mx-auto shadow-inner flex items-center justify-center">
          <Image
            src={ogImageUrl}
            alt="Z-Gym Progress Card"
            width={340}
            height={340}
            unoptimized
            className="w-full h-full object-contain"
          />
        </div>

        {/* Customization Controls */}
        <div className="space-y-4 bg-muted/40 p-4 rounded-2xl border border-border/50 text-sm">
          {/* Format Switcher */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">
              {t('সাইজ ও ফরম্যাট', 'Card Format')}:
            </span>
            <div className="inline-flex rounded-xl bg-background p-1 border border-border text-xs font-bold">
              <button
                type="button"
                onClick={() => setFormat('square')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  format === 'square'
                    ? 'bg-lime-brand text-ink-base'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                1:1 Square
              </button>
              <button
                type="button"
                onClick={() => setFormat('story')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  format === 'story'
                    ? 'bg-lime-brand text-ink-base'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                9:16 Story
              </button>
            </div>
          </div>

          {/* Show Weight Opt-in Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <div className="flex items-center gap-2">
              {showWeight ? (
                <Eye className="w-4 h-4 text-lime-brand" />
              ) : (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="font-medium text-foreground text-xs sm:text-sm">
                {t('ওজন প্রকাশ করুন (অপশনাল)', 'Show weight on card')}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showWeight}
                onChange={(e) => setShowWeight(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-lime-brand"></div>
            </label>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {t(
              'ডিফল্ট হিসেবে ওজন গোপন রাখা হয়। আপনি টিক দিলে কার্ডে বর্তমান ওজন প্রদর্শিত হবে।',
              'By default, raw weight is private. Turn this on only if you wish to show kg on your card.'
            )}
          </p>
        </div>

        {/* Share Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
          <button
            onClick={handleWebShare}
            disabled={sharing}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-lime-brand text-ink-base font-bold text-xs sm:text-sm hover:bg-lime-hover transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" />
            <span>{copied ? t('কপি হয়েছে!', 'Copied!') : t('শেয়ার', 'Share')}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-card border border-border font-bold text-xs sm:text-sm hover:bg-muted text-foreground transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? t('লোড হচ্ছে...', 'Loading...') : t('ডাউনলোড', 'Download')}</span>
          </button>

          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#25D366] text-white font-bold text-xs sm:text-sm hover:opacity-90 transition-all shadow-md cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
