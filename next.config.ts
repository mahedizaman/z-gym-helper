import type { NextConfig } from "next";

// Fail loudly in production builds if NEXT_PUBLIC_APP_URL is not configured
if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_APP_URL?.trim()) {
  const fatalMsg =
    '\n====================================================================\n' +
    '❌ BUILD FAILED: NEXT_PUBLIC_APP_URL is required in production builds.\n' +
    'og:url and canonical URLs must never fall back to an unowned domain.\n' +
    'Please configure NEXT_PUBLIC_APP_URL in your build environment (e.g. https://your-domain.com).\n' +
    '====================================================================\n';
  console.error(fatalMsg);
  throw new Error(fatalMsg);
}

// Netlify's serverless runtime relies on AWS Lambda, which does not fully support
// Next.js 16 experimental streaming Partial Prerendering (PPR) manifests.
// We enable PPR on Vercel and local dev, but safely disable it on Netlify builds (NETLIFY=true).
const isNetlify = process.env.NETLIFY === 'true';
const enableExperimentalPPR = !isNetlify && process.env.DISABLE_PPR !== 'true';

const nextConfig: NextConfig = {
  /* Configuration options */
  cacheComponents: enableExperimentalPPR,
  partialPrefetching: enableExperimentalPPR,
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Content-Type', value: 'application/manifest+json; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/yuhonas/free-exercise-db/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
