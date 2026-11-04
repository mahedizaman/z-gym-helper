import type { Metadata, Viewport } from 'next';
import { Saira_Condensed, Hind_Siliguri, Inter } from 'next/font/google';
import './globals.css';
import { RootProvider } from '@/components/providers/root-provider';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { PwaInstallPrompt } from '@/components/pwa/pwa-install-prompt';
import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register';
import { ConsentNotice } from '@/components/legal/consent-notice';
import { APP_CONFIG } from '@/config/app';

const sairaCondensed = Saira_Condensed({
  weight: ['700', '800'],
  subsets: ['latin'],
  variable: '--font-saira',
  display: 'swap',
});

const hindSiliguri = Hind_Siliguri({
  weight: ['400', '500', '600', '700'],
  subsets: ['bengali', 'latin'],
  variable: '--font-hind',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `${APP_CONFIG.name} — ${APP_CONFIG.taglineBn}`,
    template: `%s | ${APP_CONFIG.name}`,
  },
  description: `${APP_CONFIG.descriptionBn} (${APP_CONFIG.descriptionEn})`,
  keywords: [
    'gym helper',
    'bangladesh fitness',
    'bangla calorie calculator',
    'bangla food nutrition',
    'bengali diet chart',
    'gym workout split',
    'z gym',
    APP_CONFIG.shortName,
    APP_CONFIG.name,
  ],
  authors: [{ name: APP_CONFIG.name }],
  metadataBase: new URL(APP_CONFIG.url),
  alternates: {
    canonical: APP_CONFIG.url,
  },
  openGraph: {
    title: `${APP_CONFIG.name} — ${APP_CONFIG.taglineBn}`,
    description: APP_CONFIG.descriptionBn,
    url: APP_CONFIG.url,
    siteName: APP_CONFIG.name,
    locale: 'bn_BD',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_CONFIG.name} — ${APP_CONFIG.taglineBn}`,
    description: APP_CONFIG.descriptionBn,
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192x192.png',
    shortcut: '/icons/icon-192x192.png',
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: APP_CONFIG.shortName,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F4F5F7' },
    { media: '(prefers-color-scheme: dark)', color: '#0F1412' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      suppressHydrationWarning
      className={`${sairaCondensed.variable} ${hindSiliguri.variable} ${inter.variable} overflow-x-clip`}
      style={
        {
          '--font-display': `var(--font-saira), var(--font-hind)`,
          '--font-body': `var(--font-inter), var(--font-hind)`,
        } as React.CSSProperties
      }
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebApplication',
                  '@id': `${APP_CONFIG.url}/#webapp`,
                  name: APP_CONFIG.name,
                  alternateName: APP_CONFIG.shortName,
                  url: APP_CONFIG.url,
                  applicationCategory: 'HealthApplication',
                  operatingSystem: 'All',
                  browserRequirements: 'Requires JavaScript and HTML5 support',
                  description: APP_CONFIG.descriptionEn,
                  inLanguage: ['bn-BD', 'en-US'],
                  offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'BDT',
                  },
                },
                {
                  '@type': 'Organization',
                  '@id': `${APP_CONFIG.url}/#organization`,
                  name: APP_CONFIG.name,
                  url: APP_CONFIG.url,
                  logo: `${APP_CONFIG.url}/icons/icon-192x192.png`,
                },
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-[100dvh] flex flex-col antialiased overflow-x-clip selection:bg-lime-brand selection:text-ink-base">
        <RootProvider>
          <ServiceWorkerRegister />
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
          <MobileBottomNav />
          <PwaInstallPrompt />
          <ConsentNotice />
        </RootProvider>
      </body>
    </html>
  );
}
