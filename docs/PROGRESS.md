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
- [ ] **Phase 3: Data Layer & Services**
- [ ] **Phase 4: Foods Database, Meal Calculator & BMI (Guest-first)**
- [ ] **Phase 5: Exercise Library & Workout Plans**
- [ ] **Phase 6: Auth, Guest Merge, Dashboard & Weight Tracking**
- [ ] **Phase 7: Streaks, Progress Card, Challenges & Leaderboard**
- [ ] **Phase 8: PWA, Web Push & Announcements**
- [ ] **Phase 9: Admin Dashboard**
- [ ] **Phase 10: AdSlot, Legal Pages, SEO, A11y & Production Polish**

---

## Current Status

- **Current focus:** Completed Phase 2 (High-Energy Landing Page). Ready for Phase 3 (Data Layer & Services).
- **Next 3 steps:**
  1. Define MongoDB Mongoose schemas for all collections in `src/server/models/` (users, foods, exercises, plans, mealLogs, workoutLogs, dailySummaries, weightLogs, streaks, challenges, announcements).
  2. Implement Bangladeshi food dataset seed script with 300+ authentic items, verified sources, and macro breakdowns.
  3. Create decoupled service layer in `src/server/services/` and Next.js Route Handlers (`src/app/api/...`).
- **Decisions made:**
  - Built modular landing page sections under `src/components/landing/` for clean code structure and maintainability.
  - YouTube video modal uses privacy-safe `youtube-nocookie.com` embed mounted only upon user click to ensure zero performance overhead or third-party cookies.
  - GSAP ScrollTrigger pinned horizontal scroll uses `gsap.matchMedia` to deliver smooth desktop horizontal motion while gracefully falling back to a vertical step stack on mobile screens (<768px).
  - Live food search demo preloaded with authentic Bangladeshi foods (Bhat, Dal, Ilish, Chicken, Egg, Roti, Bhorta) with reactive serving size multipliers.
  - Full authentic legal and informational pages (`/about`, `/contact`, `/privacy`, `/terms`) created with genuine content, fulfilling AdSense requirements ahead of Phase 10.
- **Env vars needed:**
  - `NEXT_PUBLIC_APP_URL`
  - `NEXT_PUBLIC_SHOW_PRODUCTS=false`
  - `NEXT_PUBLIC_ADS_ENABLED=false`
  - `MONGODB_URI`
  - `AUTH_SECRET` / `NEXTAUTH_SECRET`
  - `ADMIN_EMAILS`
- **Known issues:**
  - None.
- **Last updated:** 2026-11-03 01:51 UTC+6
