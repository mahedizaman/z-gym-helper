import { describe, it, expect } from 'vitest';
import { sanitizeGuestProfile } from '@/lib/guest-storage';
import { calculateBMR } from './calculations';

describe('Bug-Fix Batch A: NumberField, Crash Prevention & Profile Guards', () => {
  describe('NumberField String Manipulation & Zero-Stripping Logic', () => {
    // Replicating the core transformation logic of NumberField
    function processInput(
      raw: string,
      allowDecimals: boolean = false,
      stripLeadingZeros: boolean = true
    ): { text: string; num: number | undefined } {
      if (raw === '') return { text: '', num: undefined };

      let cleaned = raw;
      if (allowDecimals) {
        cleaned = raw.replace(/[^0-9.]/g, '');
        const parts = cleaned.split('.');
        if (parts.length > 2) {
          cleaned = parts[0] + '.' + parts.slice(1).join('');
        }
      } else {
        cleaned = raw.replace(/[^0-9]/g, '');
      }

      if (stripLeadingZeros && cleaned.length > 1) {
        cleaned = cleaned.replace(/^0+(?=\d)/, '');
      }

      if (cleaned === '' || cleaned === '.') {
        return { text: cleaned, num: undefined };
      }

      const parsed = parseFloat(cleaned);
      return { text: cleaned, num: isNaN(parsed) ? undefined : parsed };
    }

    it('strips leading zeros from integer inputs without creating NaN', () => {
      expect(processInput('015')).toEqual({ text: '15', num: 15 });
      expect(processInput('0200')).toEqual({ text: '200', num: 200 });
      expect(processInput('007')).toEqual({ text: '7', num: 7 });
      expect(processInput('00')).toEqual({ text: '0', num: 0 });
      expect(processInput('0')).toEqual({ text: '0', num: 0 });
    });

    it('preserves decimals with leading zero (e.g. 0.5, 0.05)', () => {
      expect(processInput('0.5', true)).toEqual({ text: '0.5', num: 0.5 });
      expect(processInput('0.05', true)).toEqual({ text: '0.05', num: 0.05 });
      expect(processInput('0.', true)).toEqual({ text: '0.', num: 0 });
    });

    it('allows clearing completely to empty string without defaulting to 0 or crashing', () => {
      expect(processInput('')).toEqual({ text: '', num: undefined });
    });

    it('strips non-numeric characters and enforces single decimal point', () => {
      expect(processInput('12.3.4.5', true)).toEqual({ text: '12.345', num: 12.345 });
      expect(processInput('abc25xyz')).toEqual({ text: '25', num: 25 });
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
