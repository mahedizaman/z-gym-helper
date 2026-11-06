/**
 * Bengali (Bangla) Digits & Number Formatting Utilities
 */

const BENGALI_DIGITS: Record<string, string> = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
};

/**
 * Converts any Latin digits (0-9) in a number or string into Bengali digits (০-৯).
 * Preserves decimal points, plus/minus signs, percentages, and words.
 *
 * Examples:
 *   toBengaliDigits(5) => '৫'
 *   toBengaliDigits('12') => '১২'
 *   toBengaliDigits('-2.5%') => '-২.৫%'
 */
export function toBengaliDigits(input: number | string | null | undefined): string {
  if (input === null || input === undefined) return '';
  return String(input).replace(/[0-9]/g, (digit) => BENGALI_DIGITS[digit] || digit);
}
