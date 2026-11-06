'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/language-context';
import {
  X,
  Share2,
  Download,
  MessageCircle,
  Eye,
  EyeOff,
  Sparkles,
  User,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Z_INDEX } from '@/config/z-index';
import { ProgressCardView } from './progress-card-view';
import { rasterizeCardToBlob } from '@/lib/generate-card-image';

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
  const { t, locale } = useLanguage();
  const [format, setFormat] = useState<'square' | 'story'>('square');
  const [showWeight, setShowWeight] = useState(false);
  const [cardName, setCardName] = useState(nickname || 'অ্যাথলিট');
  const [sharing, setSharing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [canShareFile, setCanShareFile] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [cardBlob, setCardBlob] = useState<Blob | null>(null);
  const [isRasterizing, setIsRasterizing] = useState(true);

  // Sync initial nickname when prop changes
  const [prevNickname, setPrevNickname] = useState(nickname);
  if (prevNickname !== nickname) {
    setPrevNickname(nickname);
    setCardName(nickname || 'অ্যাথলিট');
  }

  // Check Web Share API capabilities on mount
  useEffect(() => {
    const checkCanShare = () => {
      if (typeof navigator !== 'undefined' && typeof navigator.canShare === 'function') {
        try {
          const dummyFile = new File([''], 'test.png', { type: 'image/png' });
          setCanShareFile(navigator.canShare({ files: [dummyFile] }));
        } catch {
          setCanShareFile(false);
        }
      }
    };
    checkCanShare();
  }, []);

  // Body scroll lock while modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const cleanName = cardName.trim();
  const isNameValid = cleanName.length >= 3 && cleanName.length <= 20;
  const effectiveName = isNameValid ? cleanName : locale === 'bn' ? 'অ্যাথলিট' : 'Athlete';

  // Rasterize card using browser rendering whenever props or format changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const timer = setTimeout(async () => {
      if (!cardRef.current) return;
      try {
        setIsRasterizing(true);
        const blob = await rasterizeCardToBlob(cardRef.current, {
          width: 1080,
          height: format === 'story' ? 1350 : 1080,
        });
        if (!isMounted) return;
        const url = URL.createObjectURL(blob);
        setPreviewBlobUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
        setCardBlob(blob);
      } catch (err) {
        console.error('Failed to rasterize card in browser:', err);
      } finally {
        if (isMounted) setIsRasterizing(false);
      }
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, effectiveName, streak, workouts, monthChange, weightKg, showWeight, format, locale]);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareText = `🔥 আমার Z-Gym Helper ফিটনেস প্রগ্রেস: ${streak} দিনের স্ট্রিক এবং ${workouts}টি ওয়ার্কআউট সম্পন্ন! আপনিও যোগ দিন: ${origin}`;

  const handleWebShare = async () => {
    if (!isNameValid) {
      showToast(t('অনুগ্রহ করে ৩-২০ অক্ষরের একটি বৈধ নাম দিন', 'Please enter a valid name (3-20 characters)'), 'error');
      return;
    }

    try {
      setSharing(true);
      let blob = cardBlob;
      if (!blob && cardRef.current) {
        blob = await rasterizeCardToBlob(cardRef.current, {
          width: 1080,
          height: format === 'story' ? 1350 : 1080,
        });
        setCardBlob(blob);
      }

      if (!blob) throw new Error('Card generation failed');
      const file = new File([blob], `zgym-progress-${effectiveName}-${format}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${effectiveName} - Z-Gym Progress`,
          text: shareText,
        });
        showToast(t('কার্ড সফলভাবে শেয়ার হয়েছে!', 'Card shared successfully!'), 'success');
      } else if (navigator.share) {
        await navigator.share({
          title: `${effectiveName} - Z-Gym Progress`,
          text: shareText,
          url: origin,
        });
        showToast(t('লিঙ্ক সফলভাবে শেয়ার হয়েছে!', 'Link shared successfully!'), 'success');
      } else {
        throw new Error('Web Share unsupported');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Error sharing:', err);
        showToast(
          t('শেয়ার করতে সমস্যা হয়েছে। অনুগ্রহ করে ডাউনলোড বা হোয়াটসঅ্যাপ বাটন ব্যবহার করুন।', 'Sharing failed. Please use Download or WhatsApp.'),
          'error'
        );
      }
    } finally {
      setSharing(false);
    }
  };

  const handleDownload = async () => {
    if (!isNameValid) {
      showToast(t('অনুগ্রহ করে ৩-২০ অক্ষরের একটি বৈধ নাম দিন', 'Please enter a valid name (3-20 characters)'), 'error');
      return;
    }

    try {
      setDownloading(true);
      let blob = cardBlob;
      if (!blob && cardRef.current) {
        blob = await rasterizeCardToBlob(cardRef.current, {
          width: 1080,
          height: format === 'story' ? 1350 : 1080,
        });
        setCardBlob(blob);
      }

      if (!blob) throw new Error('Failed to generate card image');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zgym-progress-${effectiveName}-${format}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(t('কার্ড সফলভাবে ডাউনলোড হয়েছে!', 'Card downloaded successfully!'), 'success');
    } catch (err) {
      console.error('Download failed:', err);
      showToast(t('ডাউনলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।', 'Download failed. Please try again.'), 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleWhatsApp = () => {
    if (!isNameValid) {
      showToast(t('অনুগ্রহ করে ৩-২০ অক্ষরের একটি বৈধ নাম দিন', 'Please enter a valid name (3-20 characters)'), 'error');
      return;
    }

    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    showToast(t('হোয়াটসঅ্যাপ খোলা হচ্ছে...', 'Opening WhatsApp...'), 'success');
  };

  return (
    <div
      style={{ zIndex: Z_INDEX.modal }}
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Hidden 1080px off-screen card rendered by the browser with genuine Bengali font shaping */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-99999px',
          top: 0,
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -100,
        }}
      >
        <ProgressCardView
          ref={cardRef}
          nickname={effectiveName}
          streak={streak}
          workouts={workouts}
          monthChange={monthChange}
          weightKg={weightKg}
          showWeight={showWeight}
          format={format}
          lang={locale}
        />
      </div>

      <div className="relative w-full max-w-lg rounded-3xl bg-card text-card-foreground border-2 border-border p-6 sm:p-7 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Toast Notification Banner */}
        {toast && (
          <div
            className={`fixed top-5 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold transition-all z-[95] animate-in fade-in slide-in-from-top-4 ${
              toast.type === 'success'
                ? 'bg-lime-brand text-ink-base border border-lime-hover'
                : 'bg-tomato-brand text-white border border-tomato-deep'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        )}

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
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Preview with Browser Rasterized Rendering */}
        <div
          className={`rounded-2xl overflow-hidden border border-border bg-[#0F1412] relative max-w-[340px] mx-auto shadow-inner flex items-center justify-center ${
            format === 'story' ? 'aspect-[4/5]' : 'aspect-square'
          }`}
        >
          {previewBlobUrl && !isRasterizing ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewBlobUrl}
              alt="Z-Gym Progress Card"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground text-xs font-semibold gap-3 min-h-[280px]">
              <div className="w-8 h-8 border-3 border-lime-brand border-t-transparent rounded-full animate-spin" />
              <span>{t('কার্ড রেন্ডার হচ্ছে...', 'Rendering progress card...')}</span>
            </div>
          )}
        </div>

        {/* Customization Controls */}
        <div className="space-y-4 bg-secondary/50 p-4 sm:p-5 rounded-2xl border border-border/70 text-sm">
          {/* Editable Name Field (Changes card only, not user profile) */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-xs font-bold text-foreground">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-lime-brand" />
                <span>{t('কার্ডে প্রদর্শিত নাম (৩-২০ অক্ষর):', 'Name on Card (3-20 chars):')}</span>
              </span>
              <span className={`text-[10px] ${isNameValid ? 'text-muted-foreground' : 'text-tomato-brand font-bold'}`}>
                {cardName.length}/20
              </span>
            </label>
            <input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder={t('ডাকনাম লিখুন...', 'Enter display name...')}
              maxLength={20}
              className={`w-full px-3.5 py-2 rounded-xl bg-background border text-xs sm:text-sm font-bold text-foreground transition-colors focus:outline-none focus:ring-2 ${
                isNameValid
                  ? 'border-border focus:ring-lime-brand'
                  : 'border-tomato-brand focus:ring-tomato-brand text-tomato-brand'
              }`}
            />
            {!isNameValid && (
              <p className="text-[11px] font-semibold text-tomato-brand mt-0.5">
                {t('নাম অবশ্যই ৩ থেকে ২০ অক্ষরের মধ্যে হতে হবে।', 'Name must be between 3 and 20 characters.')}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground">
              {t(
                'এটি শুধুমাত্র এই কার্ডে পরিবর্তন আনবে, আপনার মূল প্রোফাইল অপরিবর্তিত থাকবে।',
                'Changes name on this card only; does not edit your profile.'
              )}
            </p>
          </div>

          {/* Format Switcher */}
          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <span className="font-semibold text-foreground text-xs sm:text-sm">
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
                4:5 Story
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
                {t('ওজন প্রকাশ করুন (ঐচ্ছিক)', 'Show weight on card (optional)')}
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
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Native Web Share Button */}
            <div className="flex flex-col">
              <button
                onClick={handleWebShare}
                disabled={sharing || !isNameValid || !canShareFile || isRasterizing}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-lime-brand text-ink-base font-bold text-xs sm:text-sm hover:bg-lime-hover transition-all shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title={
                  !canShareFile
                    ? t('এই ডিভাইসে ফাইল শেয়ার সমর্থিত নয়', 'File sharing not supported on this device')
                    : ''
                }
              >
                <Share2 className="w-4 h-4" />
                <span>{sharing ? t('শেয়ার হচ্ছে...', 'Sharing...') : t('শেয়ার', 'Share')}</span>
              </button>
            </div>

            {/* Direct Image Download Button */}
            <button
              onClick={handleDownload}
              disabled={downloading || !isNameValid || isRasterizing}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-secondary border border-border font-bold text-xs sm:text-sm hover:bg-muted text-foreground transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? t('ডাউনলোড হচ্ছে...', 'Saving...') : t('ডাউনলোড', 'Download')}</span>
            </button>

            {/* WhatsApp Share Button */}
            <button
              onClick={handleWhatsApp}
              disabled={!isNameValid}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#25D366] text-white font-bold text-xs sm:text-sm hover:bg-[#20bd5a] transition-all shadow-md cursor-pointer disabled:opacity-40"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
          </div>

          {!canShareFile && (
            <p className="text-[11px] text-center text-muted-foreground pt-1">
              {t(
                '* আপনার ব্রাউজার সরাসরি ফাইল শেয়ার সমর্থন করে না। অনুগ্রহ করে "ডাউনলোড" বা "WhatsApp" ব্যবহার করুন।',
                '* Native file sharing is not supported in this browser. Please use "Download" or "WhatsApp".'
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
