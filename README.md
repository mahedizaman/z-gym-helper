# Z-Gym Helper (Z-Gym)

> **The Premier Gym, Nutrition & Habit Tracking Platform for Lifters in Bangladesh.**
> Built with Next.js App Router, Serwist PWA, Framer Motion, GSAP, MongoDB Atlas, and Auth.js.

---

## 🏋️‍♂️ Overview

**Z-Gym Helper** is an open, evidence-based fitness companion specifically tailored for the Bangladeshi diet and gym community. It solves the macro-tracking dilemma by cataloging over 300 Bangladeshi staples (Bhat, Dal, Ilish, Bhorta, Handmade Roti) paired with exact Mifflin-St Jeor energy calculations, gym split routines, habit streaks, friend challenges, and privacy-first design.

- **Guest-First Philosophy:** All calculators, food catalogs, and workouts work out-of-the-box without sign-up. Guest logs persist in browser `localStorage` and silently merge upon Google authentication.
- **Privacy First:** Only random athlete nicknames (3–20 chars) are visible publicly. Raw body weights are never published to leaderboards or shared social cards unless explicitly opted in.
- **Bilingual by Default:** Primary locale is **Bangla (বাংলা)** with a seamless instant toggle to **English (EN)**.

---

## 🛠️ Tech Stack & Architecture

- **Framework:** Next.js 16 (App Router) + TypeScript (Strict Mode)
- **Styling:** Tailwind CSS + Design Tokens (Silver, Light Green `#A9F26B`, Thunder Pink `#FF2E88`, Tomato `#FF6347`, Ink `#0F1412`)
- **Animation:** Framer Motion (Page reveals, dialogs, pill buttons) + GSAP (`@gsap/react`, `ScrollTrigger`)
- **Database:** MongoDB Atlas (Free Tier) with Mongoose ORM & Automated 30-day TTL log archiving
- **Authentication:** Auth.js (`next-auth` v5) with Google OAuth Provider
- **PWA & Offline:** Serwist Service Worker with cache isolation (personal pages and authenticated APIs are strictly network-first/no-cache)
- **Push Reminders:** Firebase Cloud Messaging (FCM) server-side admin SDK
- **Charts & Graphics:** Recharts + Next.js Dynamic Open Graph (`next/og` with Bengali Hind Siliguri font support)

---

## 📋 Environment Variables

Create a `.env.local` file in the root directory. **Never commit `.env.local` or service account keys.**

| Variable | Required | Description | Example / Default |
|---|---|---|---|
| `MONGODB_URI` | **Yes** | MongoDB Atlas connection string (the app reads `MONGODB_URI`) | `mongodb+srv://user:pass@cluster.mongodb.net/zgym` |
| `AUTH_SECRET` | **Yes** | 32+ char secret for Auth.js cookie encryption | `openssl rand -base64 32` |
| `AUTH_TRUST_HOST` | **Yes** | Required for Auth.js behind reverse proxies (Netlify, Vercel previews) | `true` |
| `AUTH_GOOGLE_ID` | **Yes** | Google Cloud Console OAuth Client ID | `*.apps.googleusercontent.com` |
| `AUTH_GOOGLE_SECRET` | **Yes** | Google Cloud Console OAuth Client Secret | Client secret string |
| `ADMIN_EMAILS` | **Yes** | Comma-separated list of server-verified admin emails | `admin@zgym.app,lead@zgym.app` |
| `NEXT_PUBLIC_APP_URL` | **Yes** | Canonical production or preview URL | `https://zgym.app` |
| `CRON_SECRET` | **Yes** | Secret key for secured reminder cron execution | Constant-time bearer token |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | Optional | Base64-encoded Firebase Service Account JSON for FCM push | Decoded securely on server only |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Optional | Client Firebase API Key for web push | `AIzaSy...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Optional | Client Firebase Auth Domain | `zgym-helper.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Optional | Client Firebase Project ID | `zgym-helper` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Optional | Client Firebase Storage Bucket | `zgym-helper.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Optional | Client Firebase Messaging Sender ID | `764408126845` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Optional | Client Firebase App ID | `1:764408126845:web:...` |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Optional | Web push VAPID key for browser FCM subscription | `BN8cJy...` |
| `NEXT_PUBLIC_ADS_ENABLED` | No | Google AdSense feature flag (`false` by default) | `false` |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | No | Google AdSense client ID (e.g. `ca-pub-XXXXXXXXXXXXXXXX`) | `ca-pub-XXXXXXXXXXXXXXXX` |
| `ADSENSE_PUBLISHER_ID` | No | Publisher ID for `/ads.txt` generation | `pub-XXXXXXXXXXXXXXXX` |
| `NEXT_PUBLIC_SHOW_PRODUCTS` | No | E-commerce feature flag (kept off for MVP) | `false` |

---

## 🗄️ Database Management & Seeding

The application includes robust, resilient database CLI tooling:

### 1. Test Database Connectivity
Verify whether your MongoDB cluster is reachable:
```bash
npm run db:ping
```
- If reachable: Prints `MongoDB connected successfully`.
- If unreachable: Prints honest diagnostic error without exposing credentials.

### 2. Seed Database
Populates verified core exercise guides and standard Bangladeshi food nutrition datasets:
```bash
npm run db:seed
```
- Runs in an isolated script environment loading `.env.local`.
- Seeds foods with transparent `verified: false` status (flagged for clinical review).
- Seeds verified YouTube form technique videos and public-domain exercise illustrations.

---

## 🚀 Deployment Guide (Host-Agnostic)

> ⚠️ **Important Note on Hosting Platforms:**
> **Do NOT deploy to Vercel Hobby if monetizing with Google AdSense.** Vercel's Terms of Service for their free "Hobby" tier strictly forbid commercial activities and advertising banners. To maintain compliance and zero cost, use **Netlify**, **Cloudflare Pages / OpenNext**, or a standard **Docker / self-hosted Node.js server**.

### Option A: Deploying on Netlify (Recommended)
1. Push your repository to GitHub or GitLab.
2. In the [Netlify App Console](https://app.netlify.com), click **Add new site > Import an existing project**.
3. Set the build configuration:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
4. In **Site Configuration > Environment Variables**, add all required production variables (`MONGODB_URI`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `ADMIN_EMAILS`, `NEXT_PUBLIC_APP_URL`, `CRON_SECRET`).
5. Deploy site. Netlify automatically utilizes the official `@netlify/plugin-nextjs` adapter for Server Actions and Route Handlers.

### Option B: Deploying via Docker / Standalone Node.js
Z-Gym Helper has zero vendor lock-in and can run anywhere standard Node.js LTS is supported.

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV NODE_ENV=production
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "run", "start"]
```

---

## ⏰ Automated Push Reminder Cron

Z-Gym Helper sends user-scheduled meal reminders and workout motivation in user local time (`Asia/Dhaka`). An automated cron workflow is provided at `.github/workflows/reminders-cron.yml` to trigger the secured endpoint:

```bash
curl -X POST https://zgym.app/api/cron/reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

The endpoint uses constant-time string comparison (`crypto.timingSafeEqual`) to prevent timing attacks.

---

## 🧪 Verification & Quality Control

Execute standard health checks before pushing changes:

```bash
# Static TypeScript validation
npm run typecheck

# Code formatting & ESLint
npm run lint

# Domain math & security unit tests
npm test

# Full PWA & Next.js production build
npm run build
```

---

## 📜 Attributions & License

- **Fonts:** Saira Condensed & Hind Siliguri (SIL Open Font License)
- **Icons:** Lucide Icons (ISC License)
- **Exercise Imagery:** Free Exercise DB (Public Domain)
- **Nutrition References:** Open Food composition models & USDA FoodData Central references (flagged for clinical human verification)
- **License:** MIT License. Built for the Bangladesh fitness community.
