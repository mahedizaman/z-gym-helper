'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { Z_INDEX } from '@/config/z-index';
import { MessageSquarePlus, X, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackDialog({ isOpen, onClose }: FeedbackDialogProps) {
  const { t } = useLanguage();
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError(t('অনুগ্রহ করে আপনার মতামত লিখুন।', 'Please enter your feedback.'));
      return;
    }
    if (message.length > 500) {
      setError(t('মতামত সর্বোচ্চ ৫০০ অক্ষরের হতে পারে।', 'Feedback cannot exceed 500 characters.'));
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          contact: contact.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || t('মতামত পাঠানো যায়নি।', 'Failed to send feedback.'));
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setMessage('');
        setContact('');
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('কোনো সমস্যা হয়েছে। আবার চেষ্টা করুন।', 'Something went wrong. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{ zIndex: Z_INDEX.modal }}
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-background text-foreground border border-border rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          type="button"
          aria-label={t('বন্ধ করুন', 'Close')}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-lime-brand/20 text-lime-brand flex items-center justify-center shrink-0">
            <MessageSquarePlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight">
              {t('আপনার মতামত দিন', 'Give Feedback')}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t('অ্যাপ আরও উন্নত করতে আপনার পরামর্শ লিখুন', 'Help us improve Z-Gym with your suggestions')}
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-lime-brand mx-auto animate-bounce" />
            <p className="font-bold text-foreground">
              {t('মতামতের জন্য ধন্যবাদ!', 'Thank you for your feedback!')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('আমরা গুরুত্ব সহকারে আপনার মতামত পর্যালোচনা করব।', 'We will carefully review your feedback.')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-2xl bg-tomato-base/15 border border-tomato-base/30 text-tomato-base text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-foreground">
                  {t('আপনার মতামত বা পরামর্শ', 'Your message')}
                </label>
                <span className={`text-[11px] ${message.length > 500 ? 'text-tomato-base font-bold' : 'text-muted-foreground'}`}>
                  {message.length}/500
                </span>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t(
                  'কোন ফিচারটি ভালো লেগেছে বা কীভাবে আরও সহজ করা যায়?',
                  'What feature did you like or how can we simplify Z-Gym?'
                )}
                rows={4}
                maxLength={500}
                required
                className="w-full px-3.5 py-2.5 rounded-2xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-lime-brand resize-none placeholder:text-muted-foreground/60"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">
                {t('মোবাইল বা ইমেইল (ঐচ্ছিক)', 'Contact info (optional)')}
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={t('উত্তরের জন্য আপনার নম্বর বা ইমেইল', 'Phone or email if you want a reply')}
                maxLength={100}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-lime-brand placeholder:text-muted-foreground/60"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-full text-xs font-bold hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {t('বাতিল', 'Cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting || !message.trim() || message.length > 500}
                className="px-5 py-2.5 rounded-full text-xs font-bold bg-lime-brand text-ink-base hover:bg-lime-hover disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t('পাঠানো হচ্ছে...', 'Sending...')}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{t('পাঠান', 'Submit')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
