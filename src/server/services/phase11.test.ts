import { describe, it, expect } from 'vitest';
import { Z_INDEX } from '@/config/z-index';
import { APP_CONFIG } from '@/config/app';

describe('Phase 11: Z-Index Scale, Locale Default & Stacking Invariants', () => {
  it('enforces strict monotonic z-index stacking hierarchy', () => {
    // Structural invariants:
    // header must be lower than overlay
    expect(Z_INDEX.header).toBeLessThan(Z_INDEX.overlay);
    // overlay must be lower than sheet/popover
    expect(Z_INDEX.overlay).toBeLessThan(Z_INDEX.sheet);
    expect(Z_INDEX.overlay).toBeLessThan(Z_INDEX.popover);
    // sheet and popover must be lower than modal
    expect(Z_INDEX.sheet).toBeLessThan(Z_INDEX.modal);
    expect(Z_INDEX.popover).toBeLessThan(Z_INDEX.modal);
    // modal must be lower than toast
    expect(Z_INDEX.modal).toBeLessThan(Z_INDEX.toast);
    // toast must be lower than max
    expect(Z_INDEX.toast).toBeLessThan(Z_INDEX.max);
  });

  it('guarantees Bangla (bn) is the default locale on first visit', () => {
    expect(APP_CONFIG.defaultLocale).toBe('bn');
    expect(APP_CONFIG.locale).toBe('bn-BD');
    expect(APP_CONFIG.supportedLocales).toContain('bn');
  });

  it('ensures brand short name reads as Z-Gym', () => {
    expect(APP_CONFIG.shortName).toBe('Z-Gym');
    expect(APP_CONFIG.name).toBe('Z-Gym Helper');
  });
});
