# AGENTS.md — Z-Gym Helper Engineering Instructions

> **Source of Truth:** For full feature specs, detailed phase checklists, and specifications, see [`docs/SPEC.md`](./docs/SPEC.md).

---

## 1. Project Overview & Name Unification
- **Full App Name:** `Z-Gym Helper`
- **Short Name:** `Z-Gym`
- **Branding Rule:** All references to the app name (navbar wordmark, footer, PWA manifest, page titles, metadata, Open Graph cards, progress share cards) must derive strictly from the single configuration file: `src/config/app.ts`.
- **Wordmark:** Simple, bold wordmark where the letter **Z** is styled as a lightning bolt symbol.
- **Audience:** Gym-goers, fitness enthusiasts, and athletes in Bangladesh.
- **Language Default:** Bilingual with **Bangla (বাংলা)** as the default locale and an **English (EN)** instant toggle.

---

## 2. Hard Constraints (Spec Section 2)
1. **Zero Budget:** Free tiers and open data only. No paid APIs or paid services. Never add anything costing money without explicit user approval.
2. **Tech Stack:**
   - Framework: **Next.js (App Router)** with **TypeScript (Strict)**
   - Styling: **Tailwind CSS** + **shadcn/ui**
   - Animation: **Framer Motion** + **GSAP** (`@gsap/react`, `ScrollTrigger`)
   - Database & ORM: **MongoDB Atlas (Free Tier)** with **Mongoose**
   - Authentication: **Auth.js** (`next-auth`)
   - Schema Validation: **Zod**
   - Charts: **Recharts**
   - PWA: **Serwist** (`@serwist/next`)
   - Push Notifications: **Firebase Cloud Messaging (FCM)**
3. **Backend Architecture:**
   - No separate Express process. The backend lives in Next.js Route Handlers (`src/app/api/...`).
   - **Crucial:** All business logic must reside in `src/server/services/` so it remains decoupled and portable to Express/NestJS or callable by future Flutter apps. Clean JSON responses only.
4. **Host Agnostic:**
   - No Vercel-proprietary vendor lock-in. Compatible with standard Node.js runtime, Netlify, or Docker/Cloudflare.
5. **Guest-First Experience:**
   - Guests can access all public tools, calculators, and foods with data persisted in `localStorage`.
   - Login is required only to sync to the server. Upon first authentication, silently and seamlessly merge guest `localStorage` data into the user's MongoDB profile.
6. **No Products / E-Commerce Now:**
   - `NEXT_PUBLIC_SHOW_PRODUCTS=false`.
   - Maintain the data schema open for future products/orders, but do not construct shop/product UI.

---

## 3. Design System & Tokens (Spec Section 3)
### Color Palette
- **Silver (Base surfaces):**
  - `50`: `#F4F5F7`
  - `100`: `#E6E8EB`
  - `300`: `#C0C5CB`
  - `500`: `#8E959D`
- **Light Green (Primary CTA, highlights, marquee strip):**
  - Base: `#A9F26B`
  - Hover: `#8FE04F`
  - Soft: `#E4FBCB`
- **Thunder Pink (Energy accent, streaks, badges, gradients):**
  - Base: `#FF2E88`
  - Soft: `#FFD6E8`
- **Tomato (Calories, burn, warnings, secondary CTA):**
  - Base: `#FF6347`
  - Deep: `#E5432A`
- **Ink (Text, dark surfaces):**
  - Base: `#0F1412`
  - Surface: `#1A211E`
  - Contrast: Pure `#FFFFFF` cards

### Contrast & Styling Rules
- **Rule 1:** Text placed on **Light Green** must always be **Ink** (`#0F1412`).
- **Rule 2:** White text on Pink or Tomato is permitted only for large bold headers; body text must use Ink. Always respect WCAG AA contrast ratios.
- **Rule 3:** Green-to-pink gradient used very sparingly (hero aura glow, special badges).
- **Dominant Surfaces:** Silver (`#F4F5F7`) and White in light mode, Ink (`#0F1412` / `#1A211E`) in dark mode.

### Typography
- **Display Headings:** `Saira Condensed` (weight 800) for Latin + `Hind Siliguri` (weight 700) for Bengali. Loaded via `next/font/google`. Fluid sizing with `clamp()`.
- **Body Text:** `Inter` for Latin + `Hind Siliguri` for Bengali.
- **Visual Rhythm:** Bold uppercase condensed typography, pill buttons with directional arrow icons, large card radii (`rounded-3xl` / 24–32px), marquee strip with star/lightning glyph dividers, dashed step-flow guides, and dark rounded footers.
- **Attributions:** Keep all media attributions logged in `ATTRIBUTIONS.md`. Never fabricate fake testimonials, fake ratings, or fake trainer numbers.

---

## 4. Animation Guidelines & Boundaries (Spec Section 4)
Both **Framer Motion** and **GSAP** are used with strict separation of concerns:
- **Framer Motion Responsibilities:**
  - Page transitions (`AnimatePresence` in `template.tsx`)
  - Staggered reveals (`whileInView`, `viewport: { once: true }`)
  - Micro-interactions (hover, tap, active pill tabs with `layoutId`)
  - Modals, dialogs, mobile sheets, dropdown animations
  - Skeleton to content cross-fades
  - Animated progress bars, rings, counters, and toasts
- **GSAP + ScrollTrigger Responsibilities:**
  - Hero intro entrance timeline (staggered headline line reveal, lightning flash, athlete image scale/parallax)
  - Velocity-responsive marquee strip
  - Pinned horizontal scroll "How it works" timeline with an animated SVG dashed line path (desktop/tablet; vertical stack on mobile)
  - Smooth section background color transitions (Silver to Ink)
  - Metric count-ups triggered by scroll position
- **Animation Rules:**
  - Always use `useGSAP` hook with explicit scoping and automatic cleanup.
  - Register `ScrollTrigger` once globally on the client.
  - Use `gsap.matchMedia()` for responsive animations and respect `prefers-reduced-motion`.
  - **Never** animate the same DOM node or property with both Framer Motion and GSAP.
  - Only animate `transform`, `opacity`, and `clip-path` for 60fps performance on mobile.
  - Prevent Flash of Unstyled Content (FOUC) or permanent `opacity: 0` when JS is delayed.

---

## 5. Responsive & Mobile-First Standards (Spec Section 5)
- Mobile-first approach: test 360px, 390px, 430px, 744px (iPad mini), 768px, 820px, 1024px, 1280px, 1440px, 1920px.
- Navigation collapses to a shadcn `Sheet` drawer below `lg` (1024px).
- Bottom navigation tab bar on mobile for logged-in viewports.
- Always use `dvh` instead of `vh`, with `env(safe-area-inset-*)` padding.
- Touch target minimum: **44px × 44px**. No desktop-only hover dependencies.
- Tables adapt to card layouts on mobile screens.
- Zero horizontal overflow (`overflow-x-hidden` on shells).

---

## 6. Ads & Legal Policies (Spec Section 10)
- **Web Ads:** Google AdSense integration via reusable `<AdSlot />` with reserved static layout height to prevent Cumulative Layout Shift (CLS).
- Default: `NEXT_PUBLIC_ADS_ENABLED=false`.
- Strict exclusion: No ads on `/login`, `/settings`, or `/admin`.
- Cookie/Consent notice component included.
- Completed, genuine `/about`, `/contact`, `/privacy`, and `/terms` pages. No placeholder text or "coming soon" blocks.

---

## 7. Quality & Verification Standards (Spec Section 11)
- Strict TypeScript (`tsc --noEmit` clean).
- Clean ESLint with zero errors.
- Unit tests for core domain math:
  - Mifflin-St Jeor BMR & TDEE calculation
  - MET exercise calorie burn
  - BMI and health categorisation
  - Streak tracking logic in `Asia/Dhaka` timezone
  - Weight loss / delta percentages
- Accessible semantic HTML, aria labels, and contrast compliance.
- SEO: metadata, canonical tags, Open Graph images, JSON-LD structured data.
