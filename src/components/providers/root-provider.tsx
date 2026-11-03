'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { LanguageProvider } from '@/lib/language-context';
import { AuthProvider } from '@/components/auth/auth-provider';
import { GuestSyncListener } from '@/components/auth/guest-sync-listener';

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <GuestSyncListener />
      <NextThemesProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <LanguageProvider>{children}</LanguageProvider>
      </NextThemesProvider>
    </AuthProvider>
  );
}
