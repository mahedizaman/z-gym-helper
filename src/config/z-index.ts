/**
 * Unified Z-Index Scale for Z-Gym Helper
 *
 * Single source of truth for stacking context across the application.
 * Prevents z-index collisions between sticky navigation, sheets, modals, and toasts.
 */
export const Z_INDEX = {
  /** Background elements and decorative auras */
  behind: -10,
  /** Standard in-flow components */
  base: 0,
  /** Floating badges, card chips, relative overlays */
  raised: 10,
  /** Sticky header bar and fixed bottom navigation */
  header: 40,
  bottomNav: 40,
  /** Full-screen backdrop overlays */
  overlay: 60,
  /** Mobile navigation sheets, side drawers, slide-overs */
  sheet: 70,
  /** Floating popovers and desktop dropdown menus */
  popover: 70,
  /** Centered interactive modals and confirmation dialogs */
  modal: 80,
  /** Ephemeral notification toasts, rest timer floating pills */
  toast: 90,
  /** Utmost priority alerts and system overlays */
  max: 100,
} as const;
