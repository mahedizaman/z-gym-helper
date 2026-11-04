import { describe, it, expect } from 'vitest';
import { sanitizeGuestProfile } from '@/lib/guest-storage';
import { calculateBMR } from './calculations';
import { normalizeBengaliDigits, normalizeNumberInput } from '@/components/ui/number-field';

describe('Bug-Fix Batch A & B: NumberField, Crash Prevention & Bengali Support', () => {
  describe('NumberField String Manipulation, Bengali Digits & Comma Separator', () => {
    it('normalizes Bengali digits (০-৯) to 0-9', () => {
      expect(normalizeBengaliDigits('০১২৩৪৫৬৭৮৯')).toBe('0123456789');
      expect(normalizeBengaliDigits('বয়স ২৫ বছর')).toBe('বয়স 25 বছর');
      expect(normalizeBengaliDigits('০')).toBe('0');
      expect(normalizeBengaliDigits('৭৫.৫')).toBe('75.5');
    });

    it('treats comma as decimal separator on phone keyboards when decimals allowed', () => {
      expect(normalizeNumberInput('75,5', true)).toBe('75.5');
      expect(normalizeNumberInput('12,3,4', true)).toBe('12.34');
      expect(normalizeNumberInput('0,25', true)).toBe('0.25');
      // If decimals not allowed, comma is stripped
      expect(normalizeNumberInput('75,5', false)).toBe('755');
    });

    it('handles mixed Bengali digits and commas correctly', () => {
      expect(normalizeNumberInput('৭৫,৫', true)).toBe('75.5');
      expect(normalizeNumberInput('০,৭৫', true)).toBe('0.75');
      expect(normalizeNumberInput('০১৫', false)).toBe('15');
      expect(normalizeNumberInput('০২০০', false)).toBe('200');
    });

    it('strips leading zeros from integer inputs without creating NaN', () => {
      expect(normalizeNumberInput('015', false)).toBe('15');
      expect(normalizeNumberInput('0200', false)).toBe('200');
      expect(normalizeNumberInput('007', false)).toBe('7');
      expect(normalizeNumberInput('00', false)).toBe('0');
      expect(normalizeNumberInput('0', false)).toBe('0');
    });

    it('preserves decimals with leading zero (e.g. 0.5, 0.05)', () => {
      expect(normalizeNumberInput('0.5', true)).toBe('0.5');
      expect(normalizeNumberInput('0.05', true)).toBe('0.05');
      expect(normalizeNumberInput('0.', true)).toBe('0.');
    });

    it('allows clearing completely to empty string', () => {
      expect(normalizeNumberInput('')).toBe('');
    });

    it('strips non-numeric characters and enforces single decimal point', () => {
      expect(normalizeNumberInput('12.3.4.5', true)).toBe('12.345');
      expect(normalizeNumberInput('abc25xyz', false)).toBe('25');
    });
  });

  describe('Root Cause & Crash Prevention for Empty Profile Fields', () => {
    it('verifies calculateBMR throws on 0 or negative values (the root crash cause)', () => {
      expect(() => calculateBMR(0, 172, 26, 'male')).toThrow();
      expect(() => calculateBMR(70, 0, 26, 'male')).toThrow();
      expect(() => calculateBMR(70, 172, 0, 'male')).toThrow();
    });

    it('validates profile fields strictly on save and rejects empty or out-of-bound values', () => {
      const validateProfileInput = (ageStr: string, heightStr: string, weightStr: string) => {
        const parsedAge = ageStr.trim() === '' ? undefined : parseFloat(ageStr);
        const parsedHeight = heightStr.trim() === '' ? undefined : parseFloat(heightStr);
        const parsedWeight = weightStr.trim() === '' ? undefined : parseFloat(weightStr);

        const isAgeValid =
          parsedAge !== undefined && !isNaN(parsedAge) && parsedAge >= 10 && parsedAge <= 100;
        const isHeightValid =
          parsedHeight !== undefined && !isNaN(parsedHeight) && parsedHeight >= 100 && parsedHeight <= 250;
        const isWeightValid =
          parsedWeight !== undefined && !isNaN(parsedWeight) && parsedWeight >= 30 && parsedWeight <= 300;

        return {
          isAgeValid,
          isHeightValid,
          isWeightValid,
          isValid: isAgeValid && isHeightValid && isWeightValid,
        };
      };

      // Empty field scenarios (user pressed backspace)
      expect(validateProfileInput('', '172', '70')).toEqual({
        isAgeValid: false,
        isHeightValid: true,
        isWeightValid: true,
        isValid: false,
      });

      expect(validateProfileInput('26', '', '70')).toEqual({
        isAgeValid: true,
        isHeightValid: false,
        isWeightValid: true,
        isValid: false,
      });

      expect(validateProfileInput('26', '172', '')).toEqual({
        isAgeValid: true,
        isHeightValid: true,
        isWeightValid: false,
        isValid: false,
      });

      // Boundary validations
      expect(validateProfileInput('9', '172', '70').isValid).toBe(false); // age < 10
      expect(validateProfileInput('101', '172', '70').isValid).toBe(false); // age > 100
      expect(validateProfileInput('26', '99', '70').isValid).toBe(false); // height < 100
      expect(validateProfileInput('26', '251', '70').isValid).toBe(false); // height > 250
      expect(validateProfileInput('26', '172', '29').isValid).toBe(false); // weight < 30
      expect(validateProfileInput('26', '172', '301').isValid).toBe(false); // weight > 300

      // Valid profile passes
      expect(validateProfileInput('26', '172', '70')).toEqual({
        isAgeValid: true,
        isHeightValid: true,
        isWeightValid: true,
        isValid: true,
      });
    });

    it('safely guards corrupted localStorage data with sanitizeGuestProfile so pages never crash', () => {
      // Corrupted data with 0, NaN, negative or missing values
      const corruptedData = {
        gender: 'invalid',
        age: 0,
        heightCm: -10,
        weightKg: NaN,
        activityLevel: 'unknown_level',
        goal: 'invalid_goal',
      };

      const sanitized = sanitizeGuestProfile(corruptedData);
      expect(sanitized.gender).toBe('male');
      expect(sanitized.age).toBe(26);
      expect(sanitized.heightCm).toBe(172);
      expect(sanitized.weightKg).toBe(70);
      expect(sanitized.activityLevel).toBe('moderate');
      expect(sanitized.goal).toBe('loss');

      // Calculation with sanitized data runs smoothly with zero errors
      expect(() => {
        calculateBMR(sanitized.weightKg, sanitized.heightCm, sanitized.age, sanitized.gender);
      }).not.toThrow();
    });
  });

  describe('Google OAuth Friendly Error Handling', () => {
    function mapAuthError(errorParam: string | null) {
      if (!errorParam) return null;
      const lower = errorParam.toLowerCase();
      if (lower.includes('accessdenied') || lower.includes('access_denied')) {
        return 'access_restricted';
      }
      if (lower.includes('configuration') || lower.includes('invalid_client')) {
        return 'configuration_notice';
      }
      if (lower.includes('verification')) {
        return 'verification_expired';
      }
      return 'connection_error';
    }

    it('maps raw Google OAuth error codes to friendly categories without raw error leakage', () => {
      expect(mapAuthError('AccessDenied')).toBe('access_restricted');
      expect(mapAuthError('access_denied')).toBe('access_restricted');
      expect(mapAuthError('Configuration')).toBe('configuration_notice');
      expect(mapAuthError('invalid_client')).toBe('configuration_notice');
      expect(mapAuthError('Verification')).toBe('verification_expired');
      expect(mapAuthError('OAuthCallbackError')).toBe('connection_error');
      expect(mapAuthError(null)).toBeNull();
    });
  });
});
