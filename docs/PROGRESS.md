# Project Progress — Z-Gym Helper

> **Master Spec Reference:** See [`docs/SPEC.md`](./SPEC.md) and [`AGENTS.md`](../AGENTS.md).

---

## Overall Roadmap & Phase Status

- [x] **Phase 0: Setup & Scaffolding**
  - [x] Initial documentation (`docs/SPEC.md`, `AGENTS.md`, `docs/PROGRESS.md`)
  - [x] Initialize Next.js project with TypeScript, Tailwind CSS, App Router
  - [x] Install dependencies (`framer-motion`, `gsap`, `@gsap/react`, `lucide-react`, `clsx`, `tailwind-merge`, `next-themes`, `@radix-ui` primitives, `zod`, `vitest`)
  - [x] Setup unified configuration in `src/config/app.ts` (App Name `Z-Gym Helper`, Short Name `Z-Gym`, URLs, PWA metadata, link structure)
  - [x] Configure Tailwind CSS tokens & CSS variables (Silver 50/100/300/500, Light Green, Thunder Pink, Tomato, Ink)
  - [x] Setup next/font (`Saira Condensed`, `Hind Siliguri`, `Inter`) with CSS variable bindings & fluid clamp typography
  - [x] Setup `.env.example` and environment configuration
  - [x] Setup directory architecture (`src/components`, `src/config`, `src/lib`, `src/server`, `src/types`)
  - [x] Verify build, typecheck, and lint
- [x] **Phase 1: Design System, Brand Shell & Motion Primitives**
  - [x] Lightning-bolt 'Z' Wordmark component (`<Wordmark />` referencing `APP_CONFIG`)
  - [x] Dark / Light mode provider and theme toggle (`next-themes` + `useIsMounted`)
  - [x] Bilingual Language Context / Hook (`useLanguage` with Bangla `bn` default and English `en` toggle + localStorage persistence)
  - [x] Motion primitives (`<Reveal />`, `<Stagger />`, `<Marquee />`, `<CountUp />`, `<PillButton />`)
  - [x] GSAP setup utility (`src/lib/gsap.ts` with client registration and cleanup hooks)
  - [x] Responsive Navigation Bar (`<Navbar />`) and Dark Rounded Footer (`<Footer />`)
  - [x] Root layout (`src/app/layout.tsx`) & page transition shell (`src/app/template.tsx`)
  - [x] Core domain math calculations (`src/server/services/calculations.ts`) & unit tests
  - [x] Attributions document (`ATTRIBUTIONS.md`)
- [x] **Phase 2: High-Energy Landing Page**
  - [x] Hero Section with GSAP entrance timeline and electric lightning aura
  - [x] Velocity-responsive Marquee strip with real platform stats
  - [x] Features Grid with staggered entrance and WCAG AA contrast compliance
  - [x] "How It Works" Section: pinned horizontal scroll on desktop/tablet with animated SVG dashed line path; responsive vertical stack on phones
  - [x] Live Food Search Demo component with instant Bengali & English fuzzy matching
  - [x] Calculators Teaser with interactive quick BMI & BMR/TDEE estimator
  - [x] Workout Plan Chooser with interactive day toggles
  - [x] Exercise Library Teaser with muscle group filter tabs
  - [x] Streak & Challenge Teaser with Asia/Dhaka streak visualization
  - [x] Bilingual FAQ Accordion component with genuine FAQs
  - [x] Complete public and legal pages (`/about`, `/contact`, `/privacy`, `/terms`)
- [x] **Phase 3: Data Layer & Services**
  - [x] Database connection manager (`src/server/db.ts` with connection caching)
  - [x] Mongoose Data Models with strict schemas (`src/server/models/`)
  - [x] Zod Schemas for input validation across entities
  - [x] Decoupled Service Layer (`foodService`, `exerciseService`, `planService`, `logService`, `streakService`, `challengeService`)
  - [x] Seed data (308 authentic Bangladeshi foods, 32 core exercises, 4 workout splits)
  - [x] Next.js Route Handlers (`/api/foods`, `/api/exercises`, `/api/plans`, `/api/seed`)
- [x] **Phase 4: Foods Database, Meal Calculator & BMI (Guest-first)**
  - [x] Guest storage abstraction (`src/lib/guest-storage.ts` for localStorage persistence)
  - [x] Interactive Food Database page (`/foods`) with real-time search, category filters, macro badges, and serving converter
  - [x] Interactive Meal Planner & Calorie Burn Calculator (`/calculator`)
  - [x] Dedicated BMI & Body Health Status page (`/bmi`)
- [x] **Phase 5: Exercise Library & Workout Plans (Reviewed Guides)**
  - [x] Exercise Library (`/exercises`) with muscle and equipment filters
  - [x] Exercise Detail Pages (`/exercises/[slug]`) with reviewed badge, muscle anatomy badges, form checkpoints, and verified video embeds
  - [x] Workout Plans (`/plans` and `/plans/[slug]`)
- [x] **Phase 6: Auth, Guest Merge, Dashboard & Weight Tracking**
  - [x] Google OAuth via Auth.js (NextAuth v5 beta)
  - [x] Guest-to-Account seamless merge engine (`POST /api/user/merge`)
  - [x] Authenticated Personal Dashboard (`/dashboard`)
  - [x] Activity Logging Hub (`/log`)
  - [x] Weight Tracking & Progress (`/progress`)
  - [x] User Settings (`/settings`) with Account Deletion (`DELETE /api/user/delete-account`)
- [x] **Phase 7: Streak Engine, Progress Card, Challenges & Leaderboard**
  - [x] Streak tracking engine based strictly on `Asia/Dhaka` timezone
  - [x] Opt-in Public Leaderboard (`/leaderboard`) ranking by streak and capped weight loss percentage
  - [x] Privacy-first athlete profiles (randomized default nicknames, private weight)
  - [x] Server-Generated Dynamic Progress Card (`/api/og/progress`) with Bangla font support
  - [x] Friend Challenges (`/challenges` and `/c/[code]`) with unguessable 8-character codes
  - [x] Sliding-window rate limiting on all write endpoints
- [x] **Phase 8: PWA, Web Push & Announcements**
  - [x] **Preliminary Fixes**:
    - [x] Removed 'verified athlete' badge from the leaderboard.
    - [x] Made `streak` the default leaderboard metric.
    - [x] Added healthy-pace advisory note to weight loss leaderboard, capped displayed percentage at 20.0%, and hid users with BMI < 18.5.
    - [x] Embedded Bengali TrueType font (`NotoSansBengali-Bold.ttf`) in `next/og` progress card route handler and verified generated PNG (`public/progress-card-bangla-preview.png`).
    - [x] Decoupled rate limiter behind the `IRateLimiterStore` interface (`InMemoryRateLimiterStore`, `setRateLimiterStore()`) allowing distributed shared stores (e.g. Redis/Upstash) to be plugged in.
  - [x] **PWA Manifest & Icons**:
    - [x] Generated manifest `public/manifest.json` strictly derived from `APP_CONFIG` (`name: 'Z-Gym Helper'`, `short_name: 'Z-Gym'`).
    - [x] Generated standard icons (192x192, 512x512), maskable icon (512x512), and apple-touch-icon with the Z lightning bolt brand mark on `#0F1412` background.
    - [x] Wired manifest and icon metadata into `src/app/layout.tsx`.
    - [x] In-app `<PwaInstallPrompt />` with `beforeinstallprompt` handling and explicit Apple iOS Safari instructions (`Add to Home Screen`).
  - [x] **Serwist Service Worker & Caching Rules**:
    - [x] Service worker source: `src/app/sw.ts` bundled with esbuild into `public/sw.js`.
    - [x] **Enforced Strict Rule**: Never cache authenticated API endpoints (`/api/*` matches `NetworkOnly`).
    - [x] **Enforced Strict Rule**: Never serve stale cached authenticated personal pages (`/dashboard`, `/log`, `/progress`, `/settings`, `/admin`, `/challenges` use `NetworkFirst` with short network timeout).
    - [x] Static assets, fonts, and images use cached strategies.
    - [x] Built-in push event listener and notification click handler in `sw.ts`.
    - [x] Registered via `<ServiceWorkerRegister />` in root layout.
  - [x] **FCM & Push Reminders**:
    - [x] `src/server/services/fcm.service.ts`: Safely decodes `FIREBASE_SERVICE_ACCOUNT_BASE64` server-side only in memory; never logs or prints credentials; handles missing or invalid env gracefully with zero crashes.
    - [x] User notification preferences: workout reminder time (HH:00), meal reminder time (HH:00), and notifications opt-out toggle.
    - [x] Settings UI (`/settings`) provides notification controls and required Apple iOS advisory note (requires iOS 16.4+ and Home Screen installation).
    - [x] Created `PushTokenModel` and route `POST /api/user/push-token` & `DELETE /api/user/push-token`.
    - [x] Extended `userService.deleteUserAccount()` to purge push tokens from `PushTokenModel`.
  - [x] **Announcements System**:
    - [x] Created `AnnouncementModel` and `announcementService`.
    - [x] On creation, dispatches a single FCM topic push to `announcements` (`/topics/announcements`).
    - [x] In-app announcement bell (`<AnnouncementBell />`) in Navbar (both desktop and mobile) with unread badge count tracking `lastSeenAnnouncementAt` (and guest localStorage fallback).
    - [x] Added `GET /api/announcements` and `POST /api/announcements/read`.
  - [x] **Secured Cron Endpoint**:
    - [x] `POST /api/cron/reminders` endpoint protected by `CRON_SECRET` using constant-time comparison (`crypto.timingSafeEqual`).
    - [x] Evaluates users' local hours in their timezone (e.g. Asia/Dhaka) and sends workout and meal push reminders.
    - [x] Created ready-to-use GitHub Actions workflow `.github/workflows/cron-reminders.yml` scheduled hourly.
  - [x] **Verification**:
    - [x] Vitest suite: 42/42 tests passing across 4 suites.
    - [x] Strict TypeScript: clean (`tsc --noEmit` 0 errors).
    - [x] ESLint: clean (0 errors, 0 warnings).
    - [x] Next.js production build: clean (80 routes compiled).
    - [x] Playwright screenshots: verified across 360px, 744px, and 1280px (0px horizontal overflow across all 16 views).
- [ ] **Phase 9: Admin Dashboard**
- [ ] **Phase 10: AdSlot, Legal Pages, SEO, A11y & Production Polish**

---

## Environment Variables Reference

Here is the complete checklist of all environment variables required by Z-Gym Helper:

| Variable Name | Required For | Description & Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | General / SEO | Public base URL of the application, e.g. `https://zgym.app` |
| `NEXT_PUBLIC_SHOW_PRODUCTS` | Spec / Feature flag | Flag for e-commerce products (must be `false` now) |
| `NEXT_PUBLIC_ADS_ENABLED` | Spec / Feature flag | Flag for Google AdSense slots (must be `false` now) |
| `MONGODB_URI` | Database | MongoDB Atlas connection string (e.g. `mongodb+srv://...`) |
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | Authentication | Cryptographic secret used by Auth.js to sign session cookies |
| `AUTH_GOOGLE_ID` | OAuth | Google Cloud Console OAuth 2.0 Client ID |
| `AUTH_GOOGLE_SECRET` | OAuth | Google Cloud Console OAuth 2.0 Client Secret |
| `ADMIN_EMAILS` | Authorization | Comma-separated list of admin email addresses |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | Web Push (FCM) | **Phase 8:** Base64-encoded JSON string of the Firebase service account private key. Decoded in memory on the server only. |
| `CRON_SECRET` | Cron Security | **Phase 8:** Secret bearer token for authenticating scheduled reminder cron dispatches via GitHub Actions or external cron services. |

---

## Current Status

- **Current focus:** Completed Phase 8 (PWA, Web Push & Announcements). Ready for Phase 9 (Admin Dashboard).
- **Next 3 steps:**
  1. Build admin route guards checking `ADMIN_EMAILS` on the server.
  2. Implement admin dashboard analytics (users count, active daily streaks, food items, logs volume).
  3. Provide admin management UI for announcements, food verification status, and exercise review.
- **Decisions made:**
  - `FIREBASE_SERVICE_ACCOUNT_BASE64` is decoded only on the server, wrapped in try/catch, and returns graceful fallback without crashing if unset or invalid.
  - Rate limiter is placed behind `IRateLimiterStore` interface so Redis/Upstash can replace in-memory storage in multi-region deployments.
  - Authenticated personal routes and `/api/*` are strictly excluded from service worker caching (`NetworkOnly` / `NetworkFirst`), guaranteeing no stale user data is served.
  - Cron endpoint uses `crypto.timingSafeEqual` with byte buffers to avoid timing vulnerability attacks.
- **Logged-in screens note for Playwright:**
  - Automated screenshots for `/dashboard`, `/log`, `/progress`, `/settings`, and `/c/preview` were checked in the unauthenticated guest view (which displays the guest login prompts / guest local data). Authenticated user session views require live Google OAuth login which cannot be automated headlessly without real Google credentials.
- **Known issues:**
  - Nutrition values need human verification against certified food composition tables (all 308 seeded items are transparently set to `verified: false`).
- **Last updated:** 2026-11-03 17:00 UTC+6
