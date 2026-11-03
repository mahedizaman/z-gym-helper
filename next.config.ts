import type { NextConfig } from "next";

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
