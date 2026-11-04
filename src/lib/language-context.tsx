'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { APP_CONFIG, type Locale } from '@/config/app';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (bn: string, en: string) => string;
  isBangla: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'zgym_language_preference';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Always initialize to default locale so server render and initial client render match identically!
  const [locale, setLocaleState] = useState<Locale>(APP_CONFIG.defaultLocale);

  // Read saved language preference strictly after mount (never during initial render)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved && APP_CONFIG.supportedLocales.includes(saved) && saved !== APP_CONFIG.defaultLocale) {
        queueMicrotask(() => {
          setLocaleState(saved);
          document.documentElement.lang = saved === 'en' ? 'en-US' : 'bn-BD';
        });
      }
    } catch {
      // Storage unavailable
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale === 'bn' ? 'bn-BD' : 'en-US';
    } catch {
      // Storage unavailable
    }
  };

  const toggleLocale = () => {
    const next = locale === 'bn' ? 'en' : 'bn';
    setLocale(next);
  };

  const t = (bn: string, en: string): string => {
    return locale === 'bn' ? bn : en;
  };

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        toggleLocale,
        t,
        isBangla: locale === 'bn',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
