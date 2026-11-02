'use client';

import React, { createContext, useContext, useState } from 'react';
import { APP_CONFIG, type Locale } from '@/config/app';
import { useIsMounted } from '@/lib/use-mounted';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (bn: string, en: string) => string;
  isBangla: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'zgym_language_preference';

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') {
    return APP_CONFIG.defaultLocale;
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && APP_CONFIG.supportedLocales.includes(saved)) {
      return saved;
    }
  } catch {
    // Local storage not available
  }
  return APP_CONFIG.defaultLocale;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);
  const mounted = useIsMounted();

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale === 'bn' ? 'bn-BD' : 'en-US';
    } catch {
      // storage unavailable
    }
  };

  const toggleLocale = () => {
    const next = locale === 'bn' ? 'en' : 'bn';
    setLocale(next);
  };

  const t = (bn: string, en: string): string => {
    if (!mounted) {
      return APP_CONFIG.defaultLocale === 'bn' ? bn : en;
    }
    return locale === 'bn' ? bn : en;
  };

  return (
    <LanguageContext.Provider
      value={{
        locale: mounted ? locale : APP_CONFIG.defaultLocale,
        setLocale,
        toggleLocale,
        t,
        isBangla: (mounted ? locale : APP_CONFIG.defaultLocale) === 'bn',
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
