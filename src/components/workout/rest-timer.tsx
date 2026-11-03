'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer, Volume2, X } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface RestTimerProps {
  initialSeconds?: number;
  isOpen: boolean;
  onClose: () => void;
  exerciseName?: string;
}

export function RestTimer({ initialSeconds = 90, isOpen, onClose, exerciseName }: RestTimerProps) {
  if (!isOpen) return null;

  return (
    <RestTimerDialog
      key={`${initialSeconds}_${exerciseName || ''}`}
      initialSeconds={initialSeconds}
      onClose={onClose}
      exerciseName={exerciseName}
    />
  );
}

interface DialogProps {
  initialSeconds: number;
  onClose: () => void;
  exerciseName?: string;
}

function RestTimerDialog({ initialSeconds, onClose, exerciseName }: DialogProps) {
  const { t } = useLanguage();
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [remaining, setRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playBeep = () => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // AudioContext might be blocked until user gesture
    }
  };

  useEffect(() => {
    if (!isRunning || remaining <= 0) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          playBeep();
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, remaining]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 0;

  const setPreset = (sec: number) => {
    setTotalSeconds(sec);
    setRemaining(sec);
    setIsRunning(true);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full mx-4 sm:mx-0 p-5 rounded-3xl bg-ink-surface text-ink-contrast border-2 border-lime-brand shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-lime-brand text-ink-base flex items-center justify-center font-bold">
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              {t('রেস্ট টাইমার', 'Rest Timer')}
              {remaining === 0 && (
                <span className="text-xs text-lime-brand font-normal animate-pulse flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5" /> {t('সময় শেষ!', 'Time Up!')}
                </span>
              )}
            </h4>
            {exerciseName && (
              <p className="text-xs text-muted-foreground truncate max-w-[180px]">{exerciseName}</p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
          aria-label="Close Rest Timer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Countdown and Progress */}
      <div className="text-center my-4">
        <div className="font-display font-black text-5xl tracking-tight text-lime-brand drop-shadow-sm font-mono">
          {formattedTime}
        </div>
        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-3">
          <div
            className="bg-lime-brand h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Preset Quick Buttons */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {[45, 60, 90, 120].map((sec) => (
          <button
            key={sec}
            onClick={() => setPreset(sec)}
            className={`px-2.5 py-1 text-xs rounded-full border transition-all cursor-pointer ${
              totalSeconds === sec
                ? 'bg-lime-brand text-ink-base border-lime-brand font-bold'
                : 'bg-white/5 border-white/10 text-zinc-300 hover:border-lime-brand/50'
            }`}
          >
            {sec}s
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all cursor-pointer ${
            isRunning
              ? 'bg-amber-400 text-ink-base hover:bg-amber-300'
              : 'bg-lime-brand text-ink-base hover:bg-lime-hover shadow-lg shadow-lime-brand/20'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              {t('বিরতি', 'Pause')}
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              {remaining === 0 ? t('পুনরায় শুরু', 'Restart') : t('চালান', 'Start')}
            </>
          )}
        </button>
        <button
          onClick={() => {
            setIsRunning(false);
            setRemaining(totalSeconds);
          }}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          title={t('রিসেট', 'Reset')}
          aria-label="Reset Timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
