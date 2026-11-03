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
  - [x] Motion primitives:
    - `<Reveal />` (staggered & fade-up entrance with Framer Motion, reduced-motion aware)
    - `<Stagger />` & `<StaggerItem />` (container staggered children)
    - `<Marquee />` (infinite scrolling strip with star/lightning dividers, pause on hover)
    - `<CountUp />` (animated metric counter with Bengali digit support)
    - `<PillButton />` (magnetic/pill CTA button with directional arrow, WCAG AA compliance, light green/ink rule)
  - [x] GSAP setup utility (`src/lib/gsap.ts` with client registration and cleanup hooks)
  - [x] Responsive Navigation Bar (`<Navbar />`) with desktop menu, active layoutId pill, language toggle, theme toggle, and mobile sheet drawer
  - [x] Responsive Dark Rounded Footer (`<Footer />`) with brand info, bilingual links, open data badges, and attributions link
  - [x] Root layout (`src/app/layout.tsx`) & page transition shell (`src/app/template.tsx`)
  - [x] Core domain math calculations (`src/server/services/calculations.ts`) & unit tests (`src/server/services/calculations.test.ts`)
  - [x] Attributions document (`ATTRIBUTIONS.md`)
  - [x] Verification: TypeScript clean (`tsc --noEmit`), ESLint clean (0 errors, 0 warnings), Vitest (6/6 tests passed), Next.js production build (`next build`) clean
- [x] **Phase 2: High-Energy Landing Page**
  - [x] Hero Section with GSAP entrance timeline (line-by-line reveal, electric lightning aura, athlete cutout silhouette with parallax, floating active stat badge, Start Free & Watch Video facade modal)
  - [x] Velocity-responsive Marquee strip with real platform stats & star glyph dividers
  - [x] Features Grid with staggered entrance, large rounded cards (24-32px), WCAG AA contrast compliance
  - [x] "How It Works" Section: pinned horizontal scroll on desktop/tablet with animated SVG dashed line path; responsive vertical stack on phones via `gsap.matchMedia`
  - [x] Live Food Search Demo component with instant Bengali & English fuzzy matching for staple Bangladeshi items (Bhat, Dal, Ilish, Murgi, Dim, Roti, Bhorta) and interactive serving recalculation
  - [x] Calculators Teaser with interactive quick BMI & BMR/TDEE estimator using domain math service
  - [x] Workout Plan Chooser: pricing-style cards for 3, 4, 5, 6 days/week splits (Full Body, Upper/Lower, Hybrid, Push-Pull-Legs) with interactive day toggles and highlighted recommendation
  - [x] Exercise Library Teaser with muscle group filter tabs (Chest, Back, Shoulders, Legs, Core, Arms) and card previews
  - [x] Streak & Challenge Teaser with Asia/Dhaka streak visualization and 1080x1350 social share card preview
  - [x] Bilingual FAQ Accordion component with genuine gym & nutrition FAQs
  - [x] Final High-Voltage CTA Banner with Pill Button
  - [x] Complete, genuine public and legal pages (`/about`, `/contact`, `/privacy`, `/terms`, etc.) with zero placeholder text
  - [x] Verification: Responsive verification (360px up to 1920px), TypeScript clean (`tsc --noEmit`), ESLint clean (0 errors, 0 warnings), Vitest (6/6 passed), Next.js production build clean (20/20 static routes prerendered)
- [x] **Phase 3: Data Layer & Services**
  - [x] Database connection manager (`src/server/db.ts` with connection caching and reconnection resilience)
  - [x] Mongoose Data Models with strict schemas (`src/server/models/`):
    - `User` (`role`, `nickname`, `lastActiveAt`, `timezone`, `profile`)
    - `Food` (`nameBn`, `nameEn`, `aliases`, `category`, `image`, `per100g`, `servings`, `source`, `verified`, text index)
    - `Exercise` (`slug`, `nameBn`, `nameEn`, `muscle`, `equipment`, `level`, `instructionsBn`, `instructionsEn`, `commonMistakesBn`, `youtubeId`, `reviewed`)
    - `Plan` (`slug`, `nameBn`, `nameEn`, `daysPerWeek`, `splitType`, `level`, `schedule`)
    - `MealLog` (`userId`, `date`, `slot`, `foodId`, `servings`, `grams`, `calculatedMacros`, TTL 30 days)
    - `WorkoutLog` (`userId`, `date`, `planId`, `completedDays`, `exercisesDone`, TTL 30 days)
    - `DailySummary` (`userId`, `date`, `totalKcal`, `totalProtein`, `totalCarbs`, `totalFat`, `workoutCompleted`, permanent)
    - `WeightLog` (`userId`, `date`, `weightKg`, `note`, permanent)
    - `Streak` (`userId`, `currentStreak`, `longestStreak`, `lastActiveDhakaDate`, `activeDates`)
    - `Challenge` (`code`, `creatorId`, `title`, `durationDays`, `metric`, `participants`, `startDate`, `endDate`, `active`)
    - `Announcement` (`title`, `body`, `type`, `createdAt`, `authorId`)
    - `PushToken` (`userId`, `token`, `endpoint`, `userAgent`)
  - [x] Zod Schemas for input validation across entities (`src/server/validators/index.ts`)
  - [x] Decoupled Service Layer (`src/server/services/`):
    - `foodService` (fuzzy search with Fuse.js fallback, pagination, category filtering)
    - `exerciseService` (filter by muscle, equipment, level, slug lookup)
    - `planService` (splits retrieval, day checkoffs)
    - `logService` (meals, workouts, TTL index support, daily summary aggregation)
    - `streakService` (Asia/Dhaka timezone evaluation, streak updates)
    - `challengeService` (create group, invite code generator, ranking)
  - [x] Seed Data and Scripts:
    - 300+ authentic Bangladeshi foods (`src/server/seeds/foods.data.ts` - 308 foods across 9 categories)
    - 32 core exercises (`src/server/seeds/exercises.data.ts`)
    - 4 complete workout splits (`src/server/seeds/plans.data.ts`)
    - Unified database seed runner (`npm run db:seed` via `src/server/seeds/seed.ts`)
  - [x] Next.js Route Handlers (`src/app/api/...`):
    - `GET /api/foods` (search, category, pagination)
    - `GET /api/exercises` & `GET /api/exercises/[slug]`
    - `GET /api/plans` & `GET /api/plans/[slug]`
    - `GET /api/seed` (secure seed endpoint)
  - [x] Unit Tests for services, validation, and data transformations (19/19 tests passing)
  - [x] Verification (TypeScript clean, ESLint clean, Vitest passing, Next.js build clean)
- [ ] **Phase 4: Foods Database, Meal Calculator & BMI (Guest-first)**
- [ ] **Phase 5: Exercise Library & Workout Plans**
- [ ] **Phase 6: Auth, Guest Merge, Dashboard & Weight Tracking**
- [ ] **Phase 7: Streaks, Progress Card, Challenges & Leaderboard**
- [ ] **Phase 8: PWA, Web Push & Announcements**
- [ ] **Phase 9: Admin Dashboard**
- [ ] **Phase 10: AdSlot, Legal Pages, SEO, A11y & Production Polish**

---

## Current Status

- **Current focus:** Phase 4 Preparation (Foods Database, Meal Calculator & BMI - Guest-first)
- **Next 3 steps:**
  1. Build `/foods` page with virtualized/paginated Bangladeshi food catalog, search bar, fuzzy filter, category pills, nutrient badges, and serving converter drawer.
  2. Build `/calculator` meal planner with meal slots (Breakfast, Lunch, Snack, Dinner), pre/post workout nutrition, live macro totals vs target, and calorie burn estimator.
  3. Build `/bmi` interactive calculator with WHO/South-Asian BMI classifications and safety disclaimers.
- **Decisions made:**
  - Database connection cached globally for serverless/Edge-compatible Node.js environments.
  - MealLog and WorkoutLog schemas configured with 30-day MongoDB TTL index (`expireAfterSeconds: 2592000`).
  - DailySummary and WeightLog stored permanently.
  - In-memory fallback dataset bundled with services so public tools and searches remain 100% operational in guest mode and offline even without MongoDB connection!
  - Next.js 16 cacheComponents compatibility: dynamic query parameters dynamically bail out prerender naturally without requiring legacy `export const dynamic = 'force-dynamic'`.
  - Fix Pass (Pre-Phase 4):
    - `POST /api/seed` disabled in production and restricted in non-production. CLI `npm run db:seed` is the canonical seeding mechanism.
    - Bangladeshi food dataset audit: All 308 items set to `verified: false`. Fabricated BIRDEM citations eliminated from models, seeds, FAQ, about page, and attributions.
    - Landing page audit: Replaced demo '21 Days Active' with actual database inventory (308 Foods, 32 Exercises), removed fake badges, and stamped social card as sample preview.
    - Mobile 360px overflow audit: Identified 5px overflow caused by mobile navbar control cluster; fixed by condensing wordmark to 'Z-GYM' on mobile, tightening gaps, and adding `overflow-x-clip` to HTML and body shells.
- **Env vars needed:**
  - `NEXT_PUBLIC_APP_URL`
  - `NEXT_PUBLIC_SHOW_PRODUCTS=false`
  - `NEXT_PUBLIC_ADS_ENABLED=false`
  - `MONGODB_URI`
  - `AUTH_SECRET` / `NEXTAUTH_SECRET`
  - `ADMIN_EMAILS`
- **Known issues:**
  - Nutrition values need human verification against certified food composition tables (all 308 seeded items are transparently set to `verified: false`).
- **Last updated:** 2026-11-03 12:45 UTC+6
