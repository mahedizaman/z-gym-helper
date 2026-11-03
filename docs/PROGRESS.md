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

## Current Status

- **Current focus:** Phase 11: Complete. Env var names verified & unified across all documentation, and header menu & notification panels re-engineered with clean solid portals, body scroll lock, and GSAP/Framer Motion curtain experience.
- **Key milestones completed in Phase 11:**
  1. Complete env var audit & synchronization (`MONGODB_URI`, `AUTH_SECRET`, `AUTH_TRUST_HOST`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `ADMIN_EMAILS`, `NEXT_PUBLIC_APP_URL`, `CRON_SECRET`, `FIREBASE_SERVICE_ACCOUNT_BASE64`, `NEXT_PUBLIC_FIREBASE_*`, `NEXT_PUBLIC_ADS_ENABLED`, `NEXT_PUBLIC_ADSENSE_CLIENT`, `ADSENSE_PUBLISHER_ID`, `NEXT_PUBLIC_SHOW_PRODUCTS`).
  2. GitHub Actions secrets in `.github/workflows/cron-reminders.yml` explicitly listed (`APP_URL`, `CRON_SECRET`).
  3. Stacking context trap fixed: rendered both mobile menu and notification panel through `document.body` portals via Radix Dialog/Sheet and Popover.
  4. Solid opaque cards with clear border and shadow in light and dark modes — zero see-through overlap.
  5. Body scroll locked on open, Esc key to dismiss, outside click to dismiss, focus trap and restoration.
  6. Fancy curtain mobile menu with GSAP clip-path polygon wipe, Framer Motion staggered typography, light green active indicator with thunder-pink accent bar, rotating close icon, and language/theme toggles.
  7. Legible Z-GYM wordmark redesign.
  8. Default locale verified as Bangla (`bn`) on first visit.
  9. Real Playwright interactive tests and screenshots across 360px, 744px, and 1280px in light and dark modes.
  10. 58/58 unit tests passing, clean typecheck, clean lint, clean production build.
- **Logged-in screens note for Playwright:**
  - Automated screenshots for `/dashboard`, `/log`, `/progress`, `/settings`, `/c/preview`, and `/admin` were captured in the unauthenticated guest view (which showcases the guest login prompt and 403 Forbidden access check on `/admin`). Authenticated user and admin session views require live Google OAuth login which cannot be automated headlessly without real Google credentials.
- **Known issues:**
  - Nutrition values need human verification against certified food composition tables (all 308 seeded items are transparently set to `verified: false`).
- **Last updated:** 2026-11-03 19:15 UTC+6
