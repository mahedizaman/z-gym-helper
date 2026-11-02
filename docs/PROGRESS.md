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
- [ ] **Phase 2: High-Energy Landing Page**
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

- **Current focus:** Completed Phase 0 & Phase 1. Ready for Phase 2 (Landing Page).
- **Next 3 steps:**
  1. Build Phase 2 Hero with line-by-line headline reveal, lightning accent, athlete cutout, and floating stat badge with GSAP + Framer Motion.
  2. Implement GSAP ScrollTrigger pinned horizontal-scroll "How it works" timeline with animated SVG dashed line path.
  3. Implement live interactive food-search demo, calculator teaser, and workout plan chooser cards on the landing page.
- **Decisions made:**
  - App name is centralized in `src/config/app.ts` as `Z-Gym Helper` (short: `Z-Gym`).
  - Bangla is the default active language, with instant in-memory & localStorage persistent toggle to English.
  - Strict color variables for Silver (50, 100, 300, 500), Light Green (`#A9F26B`), Thunder Pink (`#FF2E88`), Tomato (`#FF6347`), and Ink (`#0F1412` / `#1A211E`).
  - Strict Rule 1 enforced: text on Light Green is always Ink (`#0F1412`).
  - React 19 hydration safety handled via `useSyncExternalStore` in `useIsMounted`.
  - Next.js 16 Partial Prerendering compliance ensured across client components.
  - Pure domain math decoupled into `src/server/services/calculations.ts` with 6 comprehensive unit tests.
- **Env vars needed:**
  - `NEXT_PUBLIC_APP_URL`
  - `NEXT_PUBLIC_SHOW_PRODUCTS=false`
  - `NEXT_PUBLIC_ADS_ENABLED=false`
  - `MONGODB_URI`
  - `AUTH_SECRET` / `NEXTAUTH_SECRET`
  - `ADMIN_EMAILS`
- **Known issues:**
  - None.
- **Last updated:** 2026-11-03 01:31 UTC+6
