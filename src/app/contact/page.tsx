'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { Mail, MessageSquare, MapPin, CheckCircle2 } from 'lucide-react';
import { PillButton } from '@/components/motion/pill-button';

export default function ContactPage() {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-16 md:py-24">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-lime-soft border border-lime-brand/30 text-ink-base text-xs font-bold uppercase tracking-wider mb-4">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{t('যোগাযোগ ও প্রতিক্রিয়া', 'Get in Touch')}</span>
        </div>
        <h1 className="font-display font-black text-fluid-section uppercase tracking-tight text-foreground">
          {t('আমাদের সাথে যোগাযোগ করুন', 'CONTACT Z-GYM HELPER')}
        </h1>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          {t(
            'কোনো নতুন দেশি খাবারের পুষ্টিমান যোগ করতে চান বা কোনো পরামর্শ রয়েছে? আমাদের জানান।',
            'Have a new Bangladeshi food suggestion, feedback, or a question? Reach out to our community team.'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Contact Information */}
        <div className="md:col-span-5 p-8 rounded-3xl bg-card border border-border shadow-sm flex flex-col gap-6">
          <h2 className="font-display text-2xl font-bold uppercase text-foreground">
            {t('ঠিকানা ও তথ্য', 'Community Info')}
          </h2>

          <div className="flex items-start gap-3 text-sm">
            <MapPin className="w-5 h-5 text-lime-brand shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-foreground block">{t('অবস্থান', 'Location')}</span>
              <span className="text-muted-foreground">Dhaka, Bangladesh</span>
            </div>
          </div>

          <div className="flex items-start gap-3 text-sm">
            <Mail className="w-5 h-5 text-pink-brand shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-foreground block">{t('ইমেইল', 'Email')}</span>
              <span className="text-muted-foreground">support@zgym.app</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/50 border border-border text-xs text-muted-foreground leading-relaxed mt-2">
            {t(
              'আমরা সাধারণত ২৪-৪৮ ঘণ্টার মধ্যে উত্তর দিয়ে থাকি। ওপেন সোর্স খাদ্য তালিকা সম্প্রসারণে আপনার পরামর্শ অত্যন্ত মূল্যবান।',
              'We respond within 24-48 hours. Your food database suggestions directly help thousands of lifters.'
            )}
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7 p-8 rounded-3xl bg-card border border-border shadow-sm">
          {submitted ? (
            <div className="p-8 text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-lime-soft text-ink-base flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-ink-base" />
              </div>
              <h3 className="font-display text-2xl font-black uppercase text-foreground mb-2">
                {t('বার্তা সফলভাবে পাঠানো হয়েছে!', 'Message Sent Successfully!')}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                {t(
                  'আপনার বার্তার জন্য ধন্যবাদ। আমাদের টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে।',
                  'Thank you for reaching out. Our team will review your message shortly.'
                )}
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs font-bold text-lime-hover uppercase underline cursor-pointer"
              >
                {t('আরেকটি বার্তা পাঠান', 'Send another message')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  {t('আপনার নাম', 'Your Name')}
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('যেমন: তানভীর আহমেদ', 'e.g. Tanvir Ahmed')}
                  className="w-full px-4 py-3 rounded-2xl bg-secondary/60 border border-border focus:border-lime-brand text-foreground placeholder:text-muted-foreground text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  {t('আপনার ইমেইল', 'Your Email')}
                </label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="tanvir@example.com"
                  className="w-full px-4 py-3 rounded-2xl bg-secondary/60 border border-border focus:border-lime-brand text-foreground placeholder:text-muted-foreground text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  {t('আপনার বার্তা বা খাবারের প্রস্তাবনা', 'Your Message or Food Suggestion')}
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={t(
                    'আপনার প্রশ্ন, মতামত বা নতুন খাবারের পুষ্টিমান সম্পর্কিত বিবরণ লিখুন...',
                    'Write your inquiry or suggest a Bangladeshi food item with recipe details...'
                  )}
                  className="w-full px-4 py-3 rounded-2xl bg-secondary/60 border border-border focus:border-lime-brand text-foreground placeholder:text-muted-foreground text-sm outline-none resize-none"
                />
              </div>

              <div className="mt-2">
                <PillButton type="submit" variant="primary" size="md" fullWidth icon="arrow">
                  {t('বার্তা পাঠান', 'Send Message')}
                </PillButton>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
