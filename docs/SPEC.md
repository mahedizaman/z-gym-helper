START
1. Role and goal
You are a senior full-stack engineer and UI/UX designer. Build a complete, production-quality, bilingual (Bangla default, English toggle) gym and nutrition web app, end to end. App name: Z-Gym Helper (short name Z-Gym). Keep the name in one config file and use it everywhere: navbar wordmark, footer, PWA manifest (name and short_name), page titles, metadata, OG images and the progress card. Create a simple wordmark where the Z is a lightning bolt. It must be an installable PWA now and its API must be reusable by a future Flutter app. Audience: gym-goers in Bangladesh. The two attached images are visual references only (see section 3).
2. Hard constraints
• Zero budget: free tiers and open data only. No paid APIs. Ask me before adding anything that costs money.
• Stack: Next.js (App Router) + TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, GSAP (+ ScrollTrigger, @gsap/react), MongoDB Atlas free tier with Mongoose, Auth.js, Zod, Recharts, Serwist (PWA), Firebase Cloud Messaging (push).
• No separate Express server. Backend = Next.js Route Handlers. Put all business logic in src/server/services so it can move to Express or NestJS later. The API must be clean JSON so Flutter can call it.
• Keep deployment host-agnostic (no Vercel-only features). I develop on Vercel Hobby, but it is non-commercial only, so before ads go live the app must be movable to Netlify or Cloudflare Pages.
• Guests can browse everything and use the calculators without login (data in localStorage). Login is required only to save data to the server. On first login, merge guest data into the account.
• No Products or shop section now. Add the flag NEXT_PUBLIC_SHOW_PRODUCTS=false and keep the data model open for future products and orders. Do not build product pages.
3. Design system
Palette (define as CSS variables and Tailwind/shadcn theme tokens; light and dark mode):
• Silver (base surfaces): 50 #F4F5F7, 100 #E6E8EB, 300 #C0C5CB, 500 #8E959D
• Light green (primary CTA, highlights, marquee strip): #A9F26B, hover #8FE04F, soft #E4FBCB
• Thunder pink (energy accent, streaks, badges, gradients): #FF2E88, soft #FFD6E8
• Tomato (calories, burn, warnings, secondary CTA): #FF6347, deep #E5432A
• Ink (text, dark surfaces): #0F1412 and #1A211E, plus white cards
Rules: text on light green is always ink. White on pink or tomato only for large bold text; use ink for small text. Check WCAG AA contrast. Use a green-to-pink gradient sparingly (one hero glow, a few badges). Silver and white dominate; accents are used with intent.
Typography: display = Saira Condensed 800 (Latin) + Hind Siliguri 700 (Bangla); body = Inter + Hind Siliguri. Load with next/font, subsets latin and bengali. Fluid sizes with clamp().
Style taken from the references: big bold uppercase condensed headings, pill buttons with an arrow icon, large rounded cards (24 to 32px radius), a marquee strip with star dividers, a hero with a centered athlete cutout and a small floating stat badge, staggered image cards, a dashed-line step flow, pricing-style cards (use these for the 3/4/5/6 days-per-week workout plan chooser), and a dark rounded footer.
Reference images are for layout, rhythm and mood only. Do not copy their text, logos, brand names or photos. Use free-licensed images (Unsplash or Pexels) or placeholders and keep an ATTRIBUTIONS.md. Do not invent testimonials, ratings, member counts or trainer names; use real numbers from the database or omit the block.
4. Animation (very important)
Every page must feel alive but stay fast. Use shadcn/ui for components, and use both animation libraries with clear roles:
• Framer Motion: page transitions (AnimatePresence in template.tsx), staggered reveals (whileInView, viewport once), hover and tap micro-interactions, layoutId shared transitions (tab underline, card to detail), animated dialogs, sheets and dropdowns, skeleton to content fades, animated progress rings and bars, number counters, toasts.
• GSAP + ScrollTrigger: hero intro timeline (line-by-line headline reveal, lightning accent, athlete image scale and parallax, floating stat badge), a marquee strip that speeds up with scroll velocity, a pinned horizontal-scroll 'how it works' section with an SVG dashed line that draws on scroll (desktop and tablet only; vertical stack on phones), scrubbed image parallax, section background shifts from silver to ink, count-up stats.
Rules: use useGSAP with a scope and automatic cleanup; register ScrollTrigger once on the client; use gsap.matchMedia for per-device variants and for prefers-reduced-motion (disable or simplify); never animate the same element or property with both libraries (Framer = React state, mount, gesture, layout; GSAP = scroll and timelines); animate transform, opacity and clip-path only; call ScrollTrigger.refresh after fonts and images load and on route change; lazy-load heavy animation code; content must stay readable if JS is slow (no permanent opacity 0 flash) and must not cause layout shift; target 60fps on a mid-range phone and use lighter animations on touch devices. Optional: Lenis smooth scroll only if it is stable with ScrollTrigger, and off on touch and reduced motion.
5. Responsive requirements
Mobile-first. It must look and work perfectly on phones, iPad mini, iPad, laptops and desktops, in portrait and landscape. Check widths: 360, 390, 430, 744 (iPad mini portrait), 768, 820, 834, 1024, 1133, 1180, 1280, 1440, 1920. Tailwind breakpoints: sm 640, md 768, lg 1024, xl 1280, 2xl 1536.
Rules: navigation becomes a shadcn Sheet below lg, and the logged-in app gets a bottom tab bar on phones; use dvh not vh, and safe-area insets; touch targets at least 44px; no hover-only features; tables become cards on small screens; charts resize; next/image with correct sizes; no horizontal scroll anywhere; test orientation change. Verify every page at each width and fix problems before finishing a phase.
6. Pages and sections
• Public: Home (hero with headline, Start Free and Watch video buttons, marquee strip with real stats, features grid, how-it-works steps, live food-search demo, calculators teaser, workout-plan chooser cards, exercise library teaser, streak and challenge teaser, FAQ, final CTA, footer), /foods, /calculator, /bmi, /plans, /exercises and /exercises/[slug], /login, /about, /contact, /privacy, /terms.
• App (logged in): /dashboard, /log (meals and workouts), /progress, /challenges and /c/[code], /leaderboard, /settings.
• Admin: /admin (section 9).
7. Features
(a) Food database. Fields: nameBn, nameEn, aliases, category, image, per100g {kcal, protein, carbs, fat, fiber, potassium, zinc, iron, calcium, sodium}, servings (bowl, piece, spoon with grams), source, verified. Search works in Bangla and English and tolerates spelling mistakes (Fuse.js over a cached list plus a Mongo text index). Seed 300+ common Bangladeshi foods first (bhat, dal, ilish, murgi, shobji, bhorta, roti, egg, milk and so on), then fill gaps from USDA FoodData Central and Open Food Facts. Record the source of every value and flag values I must verify.
(b) Meal calculator. Meal slots (breakfast, lunch, snack, dinner). Add food by grams or by serving. Live totals for all nutrients and a comparison with the daily target. Pre-workout: calories eaten before training. Post-workout: suggested intake as a range, with a disclaimer. Burn estimate = MET x weight(kg) x hours, using a MET table for common exercises. Daily balance = intake minus (1.2 x BMR + logged exercise burn). BMR by Mifflin-St Jeor. Use about 7700 kcal per kg as an estimate. State clearly in the UI that these are estimates. Safety: never suggest a target below common safe floors, show a gentle warning for extreme goals, and link to 'talk to a professional'.
(c) Weight tracking. Log weight any day. Show this month's change and the total change since joining, with a chart. Keep detailed meal and workout entries for 30 days (TTL index), but keep daily summaries and weight logs for as long as the account exists.
(d) BMI calculator with category, healthy range and a note about its limits.
(e) Workout plans. Seeded plans for 3 days per week (full body A/B/C) and for 4, 5 and 6 days per week (upper-lower and push-pull-legs variants), beginner and intermediate. Each day lists exercises with sets x reps and rest, linked to exercise pages. Users pick a plan and tick off days.
(f) Exercise library. Filter by muscle (chest, back, shoulders, arms, legs, core), equipment and level. Detail page: step-by-step guide in Bangla, common mistakes, target muscles, tips, a Bangla/English toggle, an image gallery with several images (from the public-domain free-exercise-db dataset), and 1 to 3 YouTube videos using youtube-nocookie with a click-to-load facade. Never download or re-host YouTube videos. Seed 30+ core exercises including back and shoulders. The Bangla text is AI-written, so mark it reviewed:false until a human checks it.
(g) Streak. A day counts when the user logs a meal or completes a workout. Compute days in the Asia/Dhaka timezone.
(h) Progress card. A server-generated shareable image with next/og (1080x1350 and 1080x1080): nickname, streak, workouts, monthly change. Weight stays hidden unless the user opts in. Share with the Web Share API, with download and WhatsApp fallbacks.
(i) Challenges and leaderboard. Invite link /c/[code], 2 to 10 friends, 7, 14 or 30 days, metric = streak, workouts or weight-change percent. The public leaderboard is opt-in, shows nickname only, and ranks by percent or streak, never raw kg.
(j) Reminders and announcements. Web Push through FCM topics. Users set meal and workout times in their own timezone. A secured cron endpoint does the scheduling (Vercel Cron, GitHub Actions or any external cron). iOS needs the installed PWA, so say so in the UI. Admin broadcasts are stored once (collection announcements) and shown in an in-app bell using each user's lastSeenAnnouncementAt, plus one FCM topic push to everyone. Never create one notification row per user. Users can opt out.
(k) PWA. Manifest, icons, offline shell, install prompt.
8. Data and API
Collections: users (role, nickname, lastActiveAt, timezone, profile), foods, exercises, plans, mealLogs (TTL 30 days), workoutLogs (TTL 30 days), dailySummaries, weightLogs, streaks, challenges, announcements, pushTokens. Validate every input with Zod, rate-limit write endpoints, and never trust client-side role checks.
9. Admin dashboard
/admin is protected on the server by role (first admins come from env ADMIN_EMAILS). Show: total users, active users in the last 7 days as '37/100' with a progress bar, DAU/WAU/MAU, signups today, a 30-day signup chart, and a recent logins table. Add: an announcement composer with history, basic food and exercise create and edit (including video IDs), and a user list with search and disable. Update lastActiveAt at most once per hour.
10. Ads and legal
Web ads = Google AdSense (not AdMob; AdMob is for the future Flutter app). Build an AdSlot component with reserved height (no layout shift), controlled by NEXT_PUBLIC_ADS_ENABLED=false by default. No ads on login, settings or admin. Add a consent notice where required, and privacy, terms, about and contact pages with real content. Do not leave 'coming soon' or placeholder pages anywhere, because AdSense rejects unfinished sites.
11. Quality
TypeScript strict, ESLint clean, unit tests for BMI, BMR, TDEE, MET burn, streak and weight-change logic, accessibility (keyboard, labels, contrast), SEO (metadata, sitemap, OG images, structured data where useful), Lighthouse mobile target 90+ on the landing page, no console errors, and a README with env vars, seed commands and deploy steps.
12. Build order (phases)
• Phase 0, Setup: create the project, install everything, folder structure, env example, fonts, tokens. Write AGENTS.md (a condensed copy of sections 2 to 5, 10 and 11 of this prompt) and docs/PROGRESS.md (this checklist). Also save this ENTIRE prompt verbatim as docs/SPEC.md. It is the source of truth for features, data, admin and phases, and AGENTS.md must point to it.
• Phase 1, Design system and shell: theme, navbar, footer, motion primitives (Reveal, Stagger, Marquee, CountUp, MagneticButton), GSAP setup, dark mode.
• Phase 2: landing page with all animations.
• Phase 3: data layer: models, seed scripts, route handlers, service layer.
• Phase 4: foods, meal calculator, BMI (guest mode first).
• Phase 5: exercise library and workout plans.
• Phase 6: auth, guest-to-account merge, dashboard, history, weight tracking.
• Phase 7: streak, progress card, challenges, leaderboard.
• Phase 8: PWA, push reminders, announcements.
• Phase 9: admin dashboard.
• Phase 10: ads, legal pages, SEO, accessibility, performance, full responsive QA, README.
13. How to work (important)
• Work phase by phase. Before coding a phase, write its task list into docs/PROGRESS.md.
• After every meaningful task update docs/PROGRESS.md: status per item ([ ] todo, [~] in progress, [x] done), Current focus, Next 3 steps, Decisions made, Env vars needed, Known issues, Last updated.
• Before marking a phase done, run typecheck, lint, tests and build, and check the responsive widths. Then commit with the message 'phase-N: summary'.
• If you are about to run out of context or time, stop starting new work, update PROGRESS.md, commit, and print a one-paragraph status.
• Make sensible decisions yourself and record them. Ask me only when blocked or before anything paid or destructive.
• Never leave half-written files. Finish small units and commit often.
• Do not change design tokens, stack or architecture later without a recorded reason.
END