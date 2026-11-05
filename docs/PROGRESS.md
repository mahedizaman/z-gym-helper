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
- [x] **Phase 9: Admin Dashboard**
  - [x] **Server-Side Admin Role & Guard**:
    - [x] Implemented `requireServerAdmin()` in [`src/server/utils/admin-guard.ts`](../src/server/utils/admin-guard.ts) strictly evaluated on the server using `auth()`, `ADMIN_EMAILS`, and MongoDB role checks.
    - [x] Enforced server-side authentication and admin checks on `/admin` page and every admin API endpoint (`/api/admin/*`).
    - [x] In NextAuth `signIn` callback, disabled user accounts are strictly rejected from logging in.
  - [x] **Administrative Audit Trail**:
    - [x] Created `AuditLogModel` ([`src/server/models/audit-log.model.ts`](../src/server/models/audit-log.model.ts)) logging who (`adminId`, `adminEmail`), what (`action`), when (`createdAt`), target ID, IP, and structured details.
    - [x] Audit logs recorded for every admin mutation (disabling/enabling users, creating/updating foods and exercises, broadcasting announcements).
  - [x] **Throttled `lastActiveAt` Updates**:
    - [x] Updated user service `touchLastActive()` and login session refresh so `lastActiveAt` is updated at most once per hour.
  - [x] **Platform Analytics & Privacy Protection**:
    - [x] Implemented `adminService.getMetrics()` aggregating total registered users, 7-day active members formatted as `'37/100'` with an animated progress bar, DAU / WAU / MAU, signups today (Asia/Dhaka), and 30-day signup chart using Recharts.
    - [x] **Enforced Privacy Standard**: Admins can NEVER view any member's personal meal, weight, or workout logs. Only account-level data (nickname, email, joined date, last active, status) is exposed.
  - [x] **Announcement Composer & History**:
    - [x] Composer supporting bilingual text (Bangla & English) with character counters (max 100 title, max 500 content).
    - [x] Confirmation dialog before broadcasting to all athletes.
    - [x] Rate limiting on dispatch and single FCM topic push to `/topics/announcements`.
    - [x] History table of all past announcements.
  - [x] **Food Database Management**:
    - [x] Interactive food creation & editing modal.
    - [x] **Enforced Strict Rule**: The `verified` flag can be set `true` ONLY with `source` filled in. Attempting to mark a food verified without a source citation is strictly rejected on both client and server.
  - [x] **Exercise Library Management**:
    - [x] Interactive exercise creation & editing modal.
    - [x] YouTube ID format validated to exact 11-character code or blank (no fake IDs).
    - [x] Reviewed guide toggle.
  - [x] **User Management & Access Control**:
    - [x] Searchable, paginated user list by nickname or email.
    - [x] Account disabling toggle.
    - [x] **Self & Admin Protection**: Admins cannot disable their own account and cannot disable other administrators.
  - [x] **Verification**:
    - [x] 51/51 tests passing across 5 test suites.
    - [x] Clean TypeScript (`tsc --noEmit` 0 errors).
    - [x] Clean ESLint (0 errors, 0 warnings).
    - [x] Next.js production build clean (87 static & dynamic routes compiled).
    - [x] Playwright screenshots verified across 360px, 744px, and 1280px for all 17 routes with 0px horizontal overflow.
- [x] **Phase 10: AdSlot, Legal Pages, SEO, A11y & Production Polish**
  - [x] **Fix First**:
    - [x] Implemented `requireAuthUser()` in `src/server/utils/auth-guard.ts` verifying active account status on every request and blocking disabled accounts with 403 Forbidden.
    - [x] NextAuth `session` callback dynamically queries MongoDB and terminates active sessions if `disabled: true`.
    - [x] User route handlers (`/api/user`) enforce real-time disabled checks on `GET` and `PATCH`.
    - [x] Verified with unit test suite in `src/server/services/disabled-user.test.ts` (4/4 tests passing).
  - [x] **AdSlot & ads.txt**:
    - [x] `<AdSlot />` component (`src/components/ads/ad-slot.tsx`) with reserved static layout heights (`min-h-[90px]`, `min-h-[250px]`, `min-h-[100px]`) preventing Cumulative Layout Shift (CLS: 0).
    - [x] Strict route exclusion: Never renders on `/login`, `/settings`, or `/admin`.
    - [x] Feature flag: Controlled via `NEXT_PUBLIC_ADS_ENABLED` (disabled by default `false`).
    - [x] Dynamic `/ads.txt` route handler (`src/app/ads.txt/route.ts`) driven by `ADSENSE_PUBLISHER_ID` with clean fallback comments when unset.
  - [x] **Cookie & Ads Consent Notice**:
    - [x] `<ConsentNotice />` component (`src/components/legal/consent-notice.tsx`) with localStorage persistence (`zgym_cookie_consent`), dual "Essential Only" / "Accept All" controls, and seamless integration into root layout.
  - [x] **Medical & Clinical Disclaimer**:
    - [x] Created `<MedicalDisclaimer />` (`src/components/legal/medical-disclaimer.tsx`) with compact and expanded views plus educational dialog.
    - [x] Wired into `/calculator`, `/bmi`, and `/foods` database views.
  - [x] **Site Copy Audit**:
    - [x] Removed all unverified claims (e.g. replaced "free forever" with "free to use" / "open access", removed "verified macros" claims where foods are unverified estimates, removed "বিজ্ঞাপন-মুক্ত" claims to reflect planned AdSense slots).
  - [x] **Complete Authentic Legal & Public Pages**:
    - [x] `/privacy`: Fully detailed 8-section policy detailing Google OAuth, stored user data, Firebase FCM push tokens, essential cookies, planned Google AdSense, administrative audit logs (actions + IP), 30-day automated log TTL, and one-click cascading account erasure.
    - [x] `/terms`: Terms of service with user conduct, medical disclaimer, rate limiting rules, account suspension rights, and limitation of liability.
    - [x] `/about`: Authentic mission for Bangladeshi lifters, open data pillars, guest-first values, and genuine media attributions.
    - [x] `/contact`: Community feedback and food suggestion channel with Dhaka location and support contact.
  - [x] **SEO & Structured Data**:
    - [x] Created dynamic XML sitemap (`src/app/sitemap.ts`) indexing all static public routes and core exercise slug pages.
    - [x] Created robots rule generator (`src/app/robots.ts`) allowing public indexation while disallowing `/admin/`, `/api/`, and `/login`.
    - [x] Added Schema.org JSON-LD structured data (`WebApplication` and `Organization`) in root layout head.
  - [x] **Accessibility & Lighthouse Mobile Audit**:
    - [x] Configured `:focus-visible` accessible outline rings and `@media (prefers-reduced-motion: reduce)` in `globals.css`.
    - [x] Real mobile Lighthouse run on landing page (`http://localhost:3000`):
      - **SEO:** 100
      - **Best Practices:** 96
      - **Accessibility:** 91
      - **Performance:** 72 (FCP: 0.9s, Speed Index: 2.7s, CLS: 0, TBT: 330ms)
  - [x] **Full Responsive Playwright Screenshots QA**:
    - [x] Verified all 21 routes across 360px, 744px, and 1280px viewports (63 full-page screenshots).
    - [x] **0px horizontal scroll overflow** (`overflowX = false`) on all 21 routes.
  - [x] **Comprehensive Production `README.md`**:
    - [x] Complete env vars table, CLI seed/ping commands, and host-agnostic deploy guides for Netlify and Cloudflare Pages / Docker.
    - [x] Explicitly documented why Vercel Hobby tier cannot be used commercially once Google AdSense ads are active.

- [x] **Phase 11: Env Names Consistency & Mobile Menu/Panel Portal Overhaul**
  - [x] **Part A: Environment Variable Names & Alignment**:
    - [x] Audited every `process.env` usage across the entire repository.
    - [x] Verified `src/server/db.ts` uses `MONGODB_URI` (with graceful fallback to `DATABASE_URL`).
    - [x] Completely synchronized `.env.example`, `DEPLOY.md`, `README.md`, and `docs/PROGRESS.md` with exact real variable names: `MONGODB_URI`, `AUTH_SECRET`, `AUTH_TRUST_HOST`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `ADMIN_EMAILS`, `NEXT_PUBLIC_APP_URL`, `CRON_SECRET`, `FIREBASE_SERVICE_ACCOUNT_BASE64`, `NEXT_PUBLIC_FIREBASE_*`, `NEXT_PUBLIC_ADS_ENABLED`, `NEXT_PUBLIC_ADSENSE_CLIENT`, `ADSENSE_PUBLISHER_ID`, and `NEXT_PUBLIC_SHOW_PRODUCTS`.
    - [x] Explicitly listed the exact GitHub Actions secret names in `cron-reminders.yml`: `APP_URL` and `CRON_SECRET`.
  - [x] **Part B: Header Menu & Notification Panel Portals + UX Overhaul**:
    - [x] Portaled Mobile Menu via Radix Dialog/Sheet (`src/components/ui/sheet.tsx`) to `document.body`, eliminating stacking context traps caused by header `backdrop-filter`.
    - [x] Portaled Notification Panel (`src/components/layout/announcement-bell.tsx`) using Radix Popover on desktop (>=1024px) and bottom Sheet on mobile (<1024px).
    - [x] Solid, opaque backgrounds (`bg-card` / `bg-popover`) with clear borders and shadows in both light and dark mode (zero see-through text bleed).
    - [x] Unified Z-index scale established in `src/config/z-index.ts` (`header: 40`, `overlay: 60`, `sheet: 70`, `popover: 70`, `modal: 80`, `toast: 90`, `max: 100`).
    - [x] Automatic body scroll locking (`overflow: hidden` on body when open), outside click dismiss, Escape key dismiss, focus trap, and focus restoration.
    - [x] Notification panel features inner max-height scrollable list, bilingual empty state, and preserved mark-as-read behavior.
    - [x] Fancy mobile curtain menu (`src/components/layout/mobile-menu.tsx`) featuring GSAP curtain wipe (`clip-path: polygon(...)`), Framer Motion staggered links with bold condensed typography, active indicator in light green (`#A9F26B`) with thunder-pink (`#FF2E88`) accent bar, rotating close icon, micro-interactions, language & theme switcher row at the bottom, and reduced-motion fallback.
    - [x] Redesigned Wordmark logo (`src/components/ui/wordmark.tsx`) to clearly and unmistakably read as **Z-GYM** (stylized Z lightning polygon + `-GYM`).
    - [x] Verified default language on first visit is Bangla (`bn`).
  - [x] **Playwright Interactive QA Verification**:
    - [x] Script `scripts/verify-menu-panel.mjs` ran real clicks to open the mobile menu and notification panel across 360px, 744px, and 1280px in both light and dark themes.
    - [x] Verified body scroll locking is active when opened (`document.body.style.overflow === 'hidden'`).
    - [x] Saved 10 real interaction screenshots in `docs/screenshots/`:
      - `menu-open-360-light.png`, `menu-open-360-dark.png`
      - `menu-open-744-light.png`, `menu-open-744-dark.png`
      - `panel-open-360-light.png`, `panel-open-360-dark.png`
      - `panel-open-744-light.png`, `panel-open-744-dark.png`
      - `panel-open-1280-light.png`, `panel-open-1280-dark.png`
  - [x] **Automated Tests & Quality Checks**:
    - [x] Unit test suite `src/server/services/phase11.test.ts` (Z-index scale monotonicity, Bangla first-visit default, brand short name).
    - [x] 58/58 tests passing across 7 suites (`npm test`).
    - [x] Clean TypeScript (`npm run typecheck` - 0 errors).
    - [x] Clean ESLint (`npm run lint` - 0 errors, 0 warnings).
    - [x] Production build clean (90/90 static and dynamic routes compiled).

- [x] **Bug-fix Batch A: Crash Prevention, Reusable NumberField & OAuth Error UX**
  - [x] **0) Environment Names Verification**:
    - [x] Replaced remaining `DATABASE_URL` in `README.md` with `MONGODB_URI`.
    - [x] Verified full synchronization across `DEPLOY.md`, `README.md`, `.env.example`, and `docs/PROGRESS.md`.
  - [x] **1) Profile Modal Crash Fix & Error Boundaries**:
    - [x] Root cause identified and eliminated: clearing inputs previously cast `""` to `0`, causing `calculateBMR` to throw `Error("Weight, height, and age must be positive values")` during React render, crashing the page into "This page couldn't load".
    - [x] Kept `ageStr`, `heightCmStr`, `weightKgStr` as raw string states while typing.
    - [x] Allows fields to be completely empty without defaulting to 0 or crashing.
    - [x] Never computes with `NaN`/`undefined`/0 (reactive BMR/TDEE/macros calculation guarded).
    - [x] Strict validation on save only: Age 10-100, Height 100-250 cm, Weight 30-300 kg.
    - [x] Save button disabled and short bilingual inline messages displayed when values are invalid.
    - [x] Created `sanitizeGuestProfile()` in `src/lib/guest-storage.ts` and guarded `/api/user/dashboard` to protect against corrupted localStorage/DB values.
    - [x] Created reusable `<ErrorBoundary>` (`src/components/ui/error-boundary.tsx`) with Reload button and root Next.js error fallback (`src/app/error.tsx`), wrapping calculators and dashboard.
  - [x] **2) Reusable NumberField Component & Zero-Stripping**:
    - [x] Built reusable `<NumberField>` component (`src/components/ui/number-field.tsx`):
      - Internal string state, `inputMode` numeric or decimal.
      - Strips leading zeros (e.g. `'015'` -> `'15'`, `'0200'` -> `'200'`, while preserving `'0.5'`).
      - Select-all on focus (`onFocus={(e) => e.target.select()}`).
      - Allows complete clearing/deletion to `""` without defaulting to `'0'`.
      - Min/max clamp on blur for non-empty values.
      - Integrated unit labels (`g`, `kg`, `cm`, `yrs`, `min`, `kcal`).
    - [x] Adopted across EVERY numeric input in the application:
      - Custom grams in meal calculator (`food-picker-modal.tsx`)
      - Custom grams in food database cards (`food-card.tsx`)
      - Profile modal age, height, weight (`profile-target-modal.tsx`)
      - Exercise duration minutes (`exercise-burn-section.tsx`)
      - BMI calculator height (cm/ft/in), weight (kg/lbs), age (`src/app/bmi/page.tsx`)
      - Quick weight recording modal (`dashboard-client.tsx`)
      - Weight history logging (`progress-client.tsx`)
      - Account settings biometrics and custom calorie target (`settings-client.tsx`)
      - Admin food macro creator/editor (`admin-dashboard-client.tsx`)
  - [x] **3) Google OAuth Friendly Error Handling**:
    - [x] Handled all OAuth error codes in `src/app/login/page.tsx` (`access_denied`, `invalid_client`, `Configuration`, `Verification`, etc.).
    - [x] Display clear bilingual explanation cards with concrete user actions (Guest Mode continue, Support link, Try Again) instead of raw error strings.
  - [x] **Automated Tests & Quality Checks**:
    - [x] Unit test suite `src/server/services/bugfix-batch-a.test.ts` (8 new tests covering zero-stripping, decimal preservation, empty-field crash prevention, profile validation, and OAuth error mapping).
    - [x] 66/66 unit tests passing across 8 suites (`npm test`).
    - [x] Clean TypeScript (`npm run typecheck` - 0 errors).
    - [x] Clean ESLint (`npm run lint` - 0 errors, 0 warnings).
    - [x] Clean Next.js production build (90/90 static and dynamic routes compiled).
    - [x] Real Playwright interactive verification script `scripts/verify-number-field-crash.mjs` verifying backspace/clear without crash, save disabled/re-enabled, zero-stripping on typing `'015'`/`'0200'`, Google OAuth error banner, and BMI inputs at 360px and 1280px in light and dark modes with 16 captured screenshots in `docs/screenshots/`.

---

## Environment Variables Reference

Here is the complete checklist of all environment variables required by Z-Gym Helper:

| Variable Name | Required For | Description & Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | General / SEO | Public base URL of the application, e.g. `https://zgym.app` |
| `MONGODB_URI` | Database | Primary MongoDB Atlas connection string (e.g. `mongodb+srv://...`) |
| `AUTH_SECRET` | Authentication | Cryptographic secret used by Auth.js to sign session cookies |
| `AUTH_TRUST_HOST` | Reverse Proxy | Set `true` so Auth.js trusts headers behind Netlify and Vercel proxies |
| `AUTH_GOOGLE_ID` | OAuth | Google Cloud Console OAuth 2.0 Client ID |
| `AUTH_GOOGLE_SECRET` | OAuth | Google Cloud Console OAuth 2.0 Client Secret |
| `ADMIN_EMAILS` | Authorization | Comma-separated list of admin email addresses |
| `CRON_SECRET` | Cron Security | Secret bearer token for authenticating scheduled reminder cron dispatches via GitHub Actions or external cron services |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | Web Push (FCM) | Base64-encoded JSON string of the Firebase service account private key. Decoded in memory on the server only |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Client Web Push | Client Firebase API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Client Web Push | Client Firebase Auth Domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Client Web Push | Client Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Client Web Push | Client Firebase Storage Bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Client Web Push | Client Firebase Messaging Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Client Web Push | Client Firebase Web App ID |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Client Web Push | Web Push VAPID key for Firebase Cloud Messaging browser subscription |
| `NEXT_PUBLIC_ADS_ENABLED` | Feature flag | Flag for Google AdSense slots (must be `false` now) |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | AdSense Tag | Google AdSense client attribute (e.g. `ca-pub-XXXXXXXXXXXXXXXX`) |
| `ADSENSE_PUBLISHER_ID` | Monetization / ads.txt | Google AdSense publisher ID (e.g. `pub-XXXXXXXXXXXXXXXX`) |
| `NEXT_PUBLIC_SHOW_PRODUCTS` | Spec / Feature flag | Flag for e-commerce products (must be `false` now) |

### GitHub Actions Secrets (in `.github/workflows/cron-reminders.yml`)
- `APP_URL`: Deployment base URL (e.g. `https://zgym.app` or `https://<site>.netlify.app`). Defaults to `https://zgym.app` if omitted.
- `CRON_SECRET`: High-entropy secret token passed in `Authorization: Bearer ${{ secrets.CRON_SECRET }}` matching the server `CRON_SECRET` env var.

---

## UI Batch B & Contrast Audit (2026-11-04)

### Key Milestones Completed:
1. **NumberField Bengali Digits & Comma Decimal Separator**:
   - `normalizeBengaliDigits`: Converts Bengali numerals `০-৯` (\u09E6-\u09EF) to `0-9` seamlessly as user types.
   - Treats `,` as decimal point `.` when decimals are allowed (useful for mobile and international keyboards).
   - Unit tests added in `src/server/services/bugfix-batch-a.test.ts` (all 11 tests passing).

2. **Wordmark / Logo Clarity**:
   - Updated `Wordmark` (`src/components/ui/wordmark.tsx`) to explicitly render ⚡**Z-GYM** with prominent typography.
   - Features bold lime-green **Z** with lightning bolt energy, followed by bold **-GYM** in theme foreground (or white on dark footer).
   - Eliminates prior ambiguity where the logo appeared as `-GYM`.

3. **WCAG AA / AAA Contrast Audit**:
   - **Pro Trainer Tips Box** (`/exercises/[slug]`):
     - Light Mode: Solid `#E4FBCB` background, `#0F1412` ink text and heading, `#0F1412` icon in `#A9F26B` badge.
       - **Contrast Ratio:** **16.27 : 1** (Exceeds WCAG AAA requirement of 7.0:1)
     - Dark Mode: Solid `#1A211E` ink card background, `#A9F26B/50` border, `#F4F4F5` (`zinc-100`) body text, `#A9F26B` heading.
       - **Contrast Ratio (Body text on dark card):** **14.80 : 1** (WCAG AAA)
       - **Contrast Ratio (Heading `#A9F26B` on `#1A211E`):** **12.00 : 1** (WCAG AAA)
     - Typography: 16px body text (`text-base`), comfortable line height, clean bullet list.
   - **Community Leaderboard & Challenges Pink Pills** (`/leaderboard`, `/challenges`, landing teasers):
     - Previous: `#FF2E88` on `#FFD6E8` was **2.72 : 1** (Failed WCAG AA 4.5:1).
     - Light Mode: `#0F1412` ink text on `#FFD6E8` soft pink with `#FF2E88/40` border.
       - **Contrast Ratio:** **13.70 : 1** (WCAG AAA)
     - Dark Mode: `#FFD6E8` soft pink text on `#2A111E` deep wine card with `#FF2E88/40` border.
       - **Contrast Ratio:** **11.28 : 1** (WCAG AAA)
   - **Active Workout Routine Callout** (`/plans`):
     - Light Mode: Label text updated to `#0F1412` ink text on `#E4FBCB` (**16.27 : 1** WCAG AAA).

4. **Header Mobile Menu & Notification Panel**:
   - Both rendered strictly through Radix UI Portals (`Dialog` / `Sheet` and `Popover`).
   - Solid opaque backgrounds in light (`#F4F5F7` / `#FFFFFF`) and dark (`#0F1412` / `#1A211E`) mode — zero see-through content bleed.
   - Body scroll lock enforced while open.
   - Auto-close on route change (`usePathname`) and Escape key.
   - GSAP curtain reveal with reverse animation on close and `prefers-reduced-motion` compliance.
   - Notifications: Responsive across 360, 744, 1280 (bottom Sheet on phones, Popover on desktop) with inner scrollable list and bilingual empty state.

5. **Share Card Overhaul**:
   - **Landing Page Card** (`src/components/landing/streak-challenge-teaser.tsx`):
     - Converted into a fully live, interactive card for guests.
     - Reads real streak from guest storage (`guestStorage.getGuestStreak()`).
     - Editable 'name on card' field (3-20 characters) with real-time card preview; never exposes Google name.
     - Direct Web Share, Image Download, and WhatsApp (`https://wa.me/?text=...`) buttons with toast feedback.
   - **Progress Share Modal** (`src/components/progress/progress-share-modal.tsx`):
     - Added editable name input (3-20 characters, changes card only, does not alter user profile).
     - Show-weight toggle (opt-in; weight is hidden by default).
     - Replaced Instagram button with:
       1. Native Web Share API (shares generated PNG file if supported).
       2. Download image button (downloads 1080x1350 or 1080x1080 PNG).
       3. Direct WhatsApp link (`https://wa.me/?text=...`).
     - File-share unsupported fallback with bilingual hint and toast notifications on success/failure.

6. **Fix Batch C: Theme Variant, Menu & Notification Panel**:
   - **Tailwind v4 Dark Variant**: Added `@custom-variant dark (&:where(.dark, .dark *));` in `src/app/globals.css`. Ensures all `dark:` utility classes consistently reflect `.dark` on `<html>` set by `next-themes`, decoupling them from host OS `prefers-color-scheme`.
   - **Semantic CSS Token Migration**: Mapped theme tokens (`--color-background`, `--color-foreground`, `--color-card`, `--color-card-foreground`, `--color-popover`, `--color-popover-foreground`, `--color-border`, etc.) directly in `@theme`. Migrated all portal components, sheets, modals, and popovers to semantic CSS variable classes (`bg-background text-foreground`, `bg-card text-card-foreground`) to eliminate hardcoded color mismatches.
   - **Notification Panel Overhaul** (`src/components/layout/announcement-bell.tsx`):
     - Strict 640px breakpoint: below 640px renders as a bottom Sheet (`max-h-[70dvh]`, `rounded-t-3xl`, safe-area bottom padding, header close button, solid opaque `bg-card text-card-foreground`).
     - 640px and above (tested at 744px, 935px, 1280px) renders as an anchored `Popover` under the bell (`w-[min(92vw,380px)]`, `collisionPadding={16}`, inner scrollable list, bilingual empty state, solid opaque surface).
   - **Cookie / Consent Notice Layering & Suppression** (`src/components/legal/consent-notice.tsx` & `src/config/z-index.ts`):
     - Assigned `cookieBanner: 35` (strictly below `header: 40`, `overlay: 60`, `sheet: 70`, `modal: 80`, `toast: 90`).
     - Added CSS `:has()` rules and a `MutationObserver` checking for active dialogs/popovers to completely suppress the banner whenever any modal, sheet, or popover is open.
     - Anchored above mobile bottom navigation bar (`bottom-[calc(60px+env(safe-area-inset-bottom))] lg:bottom-0`) with safe-area padding.
   - **Wordmark & Mobile Menu Contrast**:
     - Added `forceShowHelper` prop to `Wordmark` (`src/components/ui/wordmark.tsx`) so mobile menu displays full `Z-GYM HELPER` wordmark in both themes.
     - Mobile menu panel, links, and buttons use semantic background/foreground tokens with computed text-to-background contrast ratio of **17.05 : 1** (WCAG AAA).
   - **Automated Verification**:
     - Playwright script (`scripts/verify-fix-batch-c.mjs`) verified at 360, 744, 935, and 1280 across all theme toggle states under both light and dark host OS settings.
     - 28 screenshots captured and inspected in `screenshots/fix-batch-c/`.

7. **Fix Batch: Honest Copy & Canonical URL Hardening**:
   - **Honest Nutrition & Calorie Copy**: Audited landing page and calculator pages, replacing over-claims such as 'নির্ভরযোগ্য' (reliable), 'নিখুঁত' (exact), 'সঠিক' (accurate) for food macros and calorie burn with 'আনুমানিক' / 'estimates'.
   - **Unverified Estimates Notice**: Preserved the dedicated food database notice (`Nutrition Verification Notice: All values represent standardized culinary recipe and open food composition estimates...`) and the medical disclaimer modal.
   - **Future-Proof 'ফ্রি' Copy**: Replaced '১০০% ফ্রি' and 100% marketing claims with 'ফ্রি' / 'ফ্রি ব্যবহারযোগ্য' / 'No subscription fees' phrasing that stays truthful if Google AdSense or future ads are enabled.
   - **Canonical & OpenGraph Hardening**:
     - Added `resolveAppUrl()` in `src/config/app.ts` and build validation in `next.config.ts`.
     - og:url and canonical URLs (`metadataBase`, `alternates.canonical`, `openGraph.url`, `sitemap.xml`, `robots.txt`) come strictly from `NEXT_PUBLIC_APP_URL`.
     - In production builds (`NODE_ENV=production`), missing or empty `NEXT_PUBLIC_APP_URL` throws a fatal error immediately, preventing accidental deployment with unowned domains (e.g. `zgym.app`).
     - Removed fallback to unowned domains across GitHub actions workflows and progress OG cards.
   - **Unit Tests**: Added 6 tests in `src/server/services/app-url-honest-copy.test.ts` verifying URL resolution and failure conditions.

8. **Fix Batch D: Menu Close Speed, Hydration, SW in Dev & Auth Guard**:
   - **Mobile Menu Close Speed & 6x CPU Throttling**:
     - Stripped out heavy `clipPath` calculations and reverse timelines. Exit animation now animates purely GPU `transform` and `opacity` in 50ms with an 80ms fallback safety timer.
     - Removed slow overlay exit transitions. Body scroll lock (`document.body.style.overflow`) is released immediately upon close start.
     - Tapping any navigation link triggers instant close (144ms under 6x CPU throttling).
     - Verified with Playwright under 6x CPU slowdown: total close time measured at **197ms** (under 200ms target).
   - **Hydration Warning Elimination**:
     - Added `suppressHydrationWarning` to both `<html>` and `<body>` in `src/app/layout.tsx`.
     - Hardened `LanguageProvider` ([`src/lib/language-context.tsx`](file:///home/ra-one/Documents/Z-Gym%20Helper/src/lib/language-context.tsx)): initial state is unconditionally identical on server and client (`APP_CONFIG.defaultLocale`), reading `localStorage` strictly after mount in a microtask. 0 hydration warnings detected.
   - **Service Worker in Dev & Localhost Purge**:
     - Service worker registration restricted strictly to production (`process.env.NODE_ENV === 'production'` and non-localhost).
     - Added automatic one-time cleanup on localhost unregistering legacy service workers and purging CacheStorage entries.
   - **Dynamic Routes Suspense Fix**:
     - Wrapped dynamic params content on `/exercises/[slug]` and `/plans/[slug]` in `<Suspense>` boundaries with loading skeletons. Resolves Next.js 'URL data outside of Suspense' warnings while preserving static generation.
   - **Localhost Auth URL Production Guard**:
     - Production builds fail loudly with an informative error if `AUTH_URL` or `NEXTAUTH_URL` points to `localhost`, `127.0.0.1`, or `0.0.0.0`. Tested with Vitest unit tests in `src/server/services/app-url-honest-copy.test.ts`.

9. **Automated Verification & Build Status**:
   - Unit tests: 79/79 passing across 9 test suites.
   - TypeScript: Clean `tsc --noEmit`.
   - ESLint: Clean with 0 errors and 0 warnings.
   - Next.js production build: 90/90 static/dynamic routes compiled cleanly in Turbopack.

---

## Final Batch Z Plan & Checklist

- [x] **Part 1: Announcement Bug & Admin Errors** (`fix: announcement validation and admin errors`)
  - [x] a) Derived `authorEmail` and author `id` from server admin session; harmonized Zod schema, API route, and Mongoose model (`src/server/models/announcement.model.ts` is now single source of truth, duplicate definitions in `social.model.ts` removed).
  - [x] b) Supported single-language announcements (Bangla or English), mirroring the provided text to the other language automatically.
  - [x] c) Replaced `window.alert` in all admin forms (announcements, foods, exercises, users) with rich floating toast notifications, friendly bilingual messages, and field-level error messages.
  - [x] d) Translated broadcast confirmation dialog to match the active site language with live preview of the entered title/content.
  - [x] e) Graceful FCM push degradation: announcements are saved and displayed in the in-app bell even when Firebase env is absent/misconfigured, showing an informative admin toast.
  - [x] f) Added schema alignment unit tests (`announcement-schema-alignment.test.ts`, 7 tests) & Playwright verification at 360, 744, 1280 in light and dark mode.
  - [x] Verification: TypeScript clean, ESLint clean, 86/86 unit tests pass, Turbopack production build succeeds.

- [x] **Part 2: Honest Copy & Canonical URL** (`fix: honest copy, canonical url`)
  - [x] a) Audited and verified honest copy ('আনুমানিক' / 'estimates', unverified estimates notice, future-proof 'ফ্রি' copy without 100% over-claims).
  - [x] b) Verified canonical, sitemap, robots, and og:url derive strictly from `NEXT_PUBLIC_APP_URL` without unowned domain fallback, failing in production if missing.
  - [x] c) Showed discreet 'Admin' link in desktop nav and mobile menu ONLY for server-verified admin users (`session?.user?.role === 'admin'`).
  - [x] Verification: TypeScript clean, ESLint clean, 87/87 unit tests pass, Turbopack production build succeeds, Playwright screenshots at 360, 744, 1280 (light & dark).

- [x] **Part 3: Database-Backed Public Data & Owner Food Import** (`feat: admin food import, db-backed public data`)
  - [x] a) Audited public reads: reported that public `/foods`, `/calculator` food picker, `/exercises/[slug]`, and `/plans/[slug]` originally read bundled seed data. Migrated all reads to MongoDB with bundled seed data fallback and memory caching. Revalidation invalidates cache upon admin writes.
  - [x] b) Admin UTF-8 CSV bulk import for foods with downloadable template (`GET /api/admin/foods/template`), Bangla support, duplicate detection (skip/update), Zod validation, row preview, audit log (`FOOD_BULK_IMPORT`), rate limiting.
  - [x] c) Supported `public/foods/` image path with neutral SVG placeholder fallback (`public/foods/placeholder.svg`); documented image asset placement.
  - [x] d) Added unit tests for CSV parser, Bangla UTF-8 text, quotes, duplicates, validation (`src/server/utils/csv-parser.test.ts`, 10 tests), and Playwright verification flow at 360, 744, 1280.
  - [x] Verification: TypeScript clean, ESLint clean, 97/97 unit tests pass, Turbopack production build succeeds (92/92 routes), Playwright screenshots captured at 360, 744, 1280 (light & dark).

- [x] **Part 4: Professional Exercise & Calorie-Burn Section** (`feat: pro exercise burn and daily plan`)
  - [x] a) 40+ Compendium of Physical Activities catalog in `src/server/seeds/activities.data.ts` with Compendium codes, categories (Cardio, Strength, Core & Mobility, Bodyweight & HIIT, Sports popular in BD), verified/estimate flags, and MET values for Light/Moderate/Vigorous.
  - [x] b) Professional logging UI with search, category chips, Recent/Favorites, duration quick chips (10, 20, 30, 45, 60 min) + NumberField, live preview before adding, edit and delete logged exercises.
  - [x] c) Distance + time fields for running/walking/cycling with live speed (km/h) and pace (min/sec per km), speed-to-MET interpolation from Compendium tables, treadmill incline ACSM formula (`running VO2 = 0.2*S + 0.9*S*G + 3.5`, `walking VO2 = 0.1*S + 1.8*S*G + 3.5`, subtracting resting 3.5 for net burn), and sanity warnings.
  - [x] d) Optional strength mode (sets x reps x rest estimated active time: `(sets * reps * 4s + sets * rest_s) / 60` or total workout time).
  - [x] e) Extra NET burn formula `(MET - 1) * kg * hours` with formula drawer explanation preventing double-counting resting calories; routine multiplier in target profile asking for routine EXCLUDING workouts (1.2, 1.375, 1.55) with explicit helper text and legacy profile migration.
  - [x] f) Daily plan card ('আজকের হিসাব'): target eat, target burn, logged totals, net/remaining, progress bars, weekly deficit/surplus goal (0.25/0.5/0.75 kg loss, 0.25/0.5 kg gain, maintain), eat-less vs burn-more split slider (70/30 default, 50/50, 80/20, 100/0), clinical safe floors (male 1500, female 1200 kcal), 7-day mini chart of burned vs target, projected weekly weight change, post-workout recovery nutrition tip.
  - [x] g) Framer Motion delight: animated bars, burn goal celebration glow, streak logging integration in Asia/Dhaka timezone, and 'Repeat yesterday's workout' quick button.
  - [x] h) Fixed sticky header translucency bug: replaced semi-transparent blur with solid opaque `bg-background border-b border-border shadow-sm` in light and dark mode so scrolling page text never shows through behind buttons.
  - [x] i) Added unit tests for speed/pace/incline/net burn/plan math (`src/server/services/pro-exercise-burn.test.ts`, 14 tests) & Playwright verification at 360, 744, 1280 in light and dark mode (24 screenshots in `screenshots/part4/`).
  - [x] Verification: TypeScript clean, ESLint clean, 111/111 unit tests pass, Turbopack production build succeeds (92/92 routes).

- [x] **Part 5: Final Checks** (`chore: final batch checks`)
  - [x] Full test suite (111/111 vitest tests passing across 12 suites).
  - [x] Production build with `NODE_ENV=production` & `NEXT_PUBLIC_APP_URL=https://z-gym-helper.vercel.app` (all 92/92 static/dynamic routes compiled cleanly in Turbopack).
  - [x] Secret / `.env` audit via `git ls-files | grep -iE 'env|service.*account|secret'`: 0 secrets, .env, or service account credentials tracked.
  - [x] Updated `README.md` and `docs/PROGRESS.md` with CSV bulk import instructions, full real environment variable table, and food image directory guidance (`public/foods/`).

---

## Current Status

- **Current focus:** Final Batch Z completed (Parts 1 to 5 fully implemented and verified).
- **Branch state:** All tasks complete, commits ready, no remote push performed.
- **Last updated:** 2026-11-06 00:05 UTC+6
