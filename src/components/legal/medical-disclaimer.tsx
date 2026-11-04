'use client';

import React, { useState } from 'react';
import { AlertCircle, Stethoscope, ChevronRight, X } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { Z_INDEX } from '@/config/z-index';

export function MedicalDisclaimer({ compact = false }: { compact?: boolean }) {
  const { locale } = useLanguage();
  const isBn = locale === 'bn';
  const [modalOpen, setModalOpen] = useState(false);

  if (compact) {
    return (
      <>
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-tomato-base/5 border border-tomato-base/20 text-[11px] text-muted-foreground">
          <AlertCircle className="w-4 h-4 text-tomato-base shrink-0" />
          <span className="flex-1">
            {isBn
              ? 'চিকিৎসা পরামর্শ নয়: ক্যালোরি বা ব্যায়ামের হিসাবগুলো আনুমানিক।'
              : 'Not Medical Advice: Calculations and nutritional values are estimates.'}
          </span>
          <button
            onClick={() => setModalOpen(true)}
            className="text-tomato-base font-bold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
          >
            <span>{isBn ? 'বিস্তারিত' : 'Learn More'}</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {modalOpen && <MedicalDisclaimerModal onClose={() => setModalOpen(false)} isBn={isBn} />}
      </>
    );
  }

  return (
    <>
      <div className="p-4 sm:p-5 rounded-3xl bg-tomato-base/5 border border-tomato-base/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-tomato-base/10 text-tomato-base flex items-center justify-center shrink-0 mt-0.5">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h5 className="font-bold text-foreground">
              {isBn ? 'চিকিৎসা ও স্বাস্থ্য সংক্রান্ত সতর্কবার্তা' : 'Important Health & Medical Disclaimer'}
            </h5>
            <p className="text-muted-foreground leading-relaxed">
              {isBn
                ? 'Z-Gym Helper-এ প্রদত্ত BMR, TDEE, ক্যালোরি ও ব্যায়ামের পরিমাপ সাধারণ স্বাস্থ্য সচেতনতার জন্য। এটি কোনোভাবেই রেজিস্টার্ড ডাক্তার বা পুষ্টিবিদের বিকল্প নয়।'
                : 'Z-Gym Helper provides estimates for informational and tracking purposes only. Always consult a physician or registered dietitian before beginning strenuous training or major dietary restrictions.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="self-end sm:self-center px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs shrink-0 transition-colors cursor-pointer"
        >
          {isBn ? 'পূর্ণাঙ্গ নীতিমালা' : 'View Full Disclaimer'}
        </button>
      </div>

      {modalOpen && <MedicalDisclaimerModal onClose={() => setModalOpen(false)} isBn={isBn} />}
    </>
  );
}

function MedicalDisclaimerModal({ onClose, isBn }: { onClose: () => void; isBn: boolean }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{ zIndex: Z_INDEX.modal }}
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg rounded-3xl bg-card text-card-foreground border-2 border-border p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5 text-tomato-base font-bold">
            <Stethoscope className="w-5 h-5" />
            <h3 className="font-display font-black text-xl text-foreground">
              {isBn ? 'চিকিৎসা সংক্রান্ত সতর্কতা ও দায়মুক্তি' : 'Medical Disclaimer Notice'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
          <p>
            {isBn
              ? '১. পেশাদার পরামর্শের বিকল্প নয়: Z-Gym Helper অ্যাপে প্রদর্শিত সকল তথ্য, ফর্মুলা (যেমন Mifflin-St Jeor BMR, TDEE, MET ক্যালোরি ক্ষয় ও BMI) এবং পুষ্টি উপাত্ত শুধুমাত্র শিক্ষামূলক ও ব্যক্তিগত ট্র্যাকিং উদ্দেশ্যে তৈরি করা হয়েছে।'
              : '1. Not Substitute for Professional Care: All formulas, calculations (Mifflin-St Jeor BMR, TDEE, MET energy expenditure, BMI) and nutritional values on Z-Gym Helper are for general educational and personal tracking purposes only.'}
          </p>
          <p>
            {isBn
              ? '২. স্বাস্থ্য ঝুঁকি ও পরীক্ষা: আপনার যদি কোনো ধরনের দীর্ঘস্থায়ী অসুস্থতা (ডায়াবেটিস, হৃদরোগ, উচ্চ রক্তচাপ, কিডনি জটিলতা ইত্যাদি) থাকে বা আপনি গর্ভবতী হন, তবে কোনো ডায়েট বা ভারী ব্যায়াম শুরু করার পূর্বে অবশ্যই অনুমোদিত চিকিৎসকের পরামর্শ নিন।'
              : '2. Pre-existing Conditions: If you have existing medical conditions (cardiovascular disorders, diabetes, kidney issues, metabolic disorders) or are pregnant, consult a licensed healthcare professional before modifying caloric intake or initiating strenuous physical activity.'}
          </p>
          <p>
            {isBn
              ? '৩. ডেটার সীমাবদ্ধতা: খাদ্য ডেটাবেসের মানগুলো বিভিন্ন গবেষণা ও খাদ্য তালিকা থেকে সংগৃহীত। রান্নার ধরন ও মশলার পার্থক্যে প্রকৃত পুষ্টিমানে তারতম্য হতে পারে।'
              : '3. Data Variance: Food data is aggregated from standard composition tables. Actual values may vary depending on culinary preparation, oil, and ingredients.'}
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-lime-brand text-ink-base font-bold text-xs uppercase shadow-sm cursor-pointer"
          >
            {isBn ? 'বুঝেছি' : 'Understood'}
          </button>
        </div>
      </div>
    </div>
  );
}
