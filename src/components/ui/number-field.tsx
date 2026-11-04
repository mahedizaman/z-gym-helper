'use client';

import React, { forwardRef } from 'react';

/**
 * Converts Bengali numerals (০-৯) to standard Western Arabic numerals (0-9).
 */
export function normalizeBengaliDigits(input: string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return input.replace(/[০-৯]/g, (char) => {
    const idx = bengaliDigits.indexOf(char);
    return idx !== -1 ? String(idx) : char;
  });
}

/**
 * Normalizes input string by converting Bengali digits, treating commas as decimal
 * points when decimals are allowed, and enforcing single decimal / digits only.
 */
export function normalizeNumberInput(
  raw: string,
  allowDecimals: boolean = false,
  stripLeadingZeros: boolean = true
): string {
  if (raw === '') return '';

  // 1. Convert Bengali numerals (০-৯) to 0-9
  let cleaned = normalizeBengaliDigits(raw);

  if (allowDecimals) {
    // 2. Treat comma (',') as decimal separator on phone keyboards
    cleaned = cleaned.replace(/,/g, '.');
    // Allow digits and at most one decimal point
    cleaned = cleaned.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
  } else {
    // Strictly digits only (commas are stripped)
    cleaned = cleaned.replace(/[^0-9]/g, '');
  }

  // 3. Strip leading zeros (e.g. '015' -> '15', '0200' -> '200', '00' -> '0')
  // but preserve '0' or '0.' or '0.5'
  if (stripLeadingZeros && cleaned.length > 1) {
    cleaned = cleaned.replace(/^0+(?=\d)/, '');
  }

  return cleaned;
}

export interface NumberFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'min' | 'max' | 'step'> {
  value: string | number | undefined | null;
  onChange: (valueStr: string, valueNum?: number) => void;
  min?: number;
  max?: number;
  step?: number | string;
  unit?: string;
  inputMode?: 'numeric' | 'decimal';
  allowDecimals?: boolean;
  clampOnBlur?: boolean;
  selectOnFocus?: boolean;
  stripLeadingZeros?: boolean;
  label?: React.ReactNode;
  error?: boolean | string;
  errorMessage?: string;
  containerClassName?: string;
  inputClassName?: string;
}

export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  (
    {
      value,
      onChange,
      min,
      max,
      step,
      unit,
      inputMode,
      allowDecimals,
      clampOnBlur = false,
      selectOnFocus = true,
      stripLeadingZeros = true,
      label,
      error,
      errorMessage,
      placeholder,
      className,
      containerClassName = '',
      inputClassName = '',
      disabled,
      onFocus,
      onBlur,
      ...rest
    },
    ref
  ) => {
    // Determine whether decimals are allowed
    const hasDecimalStep =
      typeof step === 'number' ? step % 1 !== 0 : typeof step === 'string' && step.includes('.');
    const shouldAllowDecimals = allowDecimals ?? (inputMode === 'decimal' || hasDecimalStep);
    const resolvedInputMode: 'numeric' | 'decimal' =
      inputMode ?? (shouldAllowDecimals ? 'decimal' : 'numeric');

    // Format display string without defaulting to '0'
    const displayValue =
      value === null || value === undefined
        ? ''
        : typeof value === 'number'
        ? isNaN(value)
          ? ''
          : String(value)
        : String(value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;

      // Allow complete deletion
      if (raw === '') {
        onChange('', undefined);
        return;
      }

      const cleaned = normalizeNumberInput(raw, shouldAllowDecimals, stripLeadingZeros);

      if (cleaned === '' || cleaned === '.') {
        onChange(cleaned, undefined);
        return;
      }

      const parsedNum = parseFloat(cleaned);
      onChange(cleaned, isNaN(parsedNum) ? undefined : parsedNum);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      if (selectOnFocus) {
        // Select all on next tick / immediately
        e.target.select();
      }
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (clampOnBlur && displayValue.trim() !== '') {
        const num = parseFloat(displayValue);
        if (!isNaN(num)) {
          let clamped = num;
          if (min !== undefined && clamped < min) clamped = min;
          if (max !== undefined && clamped > max) clamped = max;
          if (clamped !== num) {
            const clampedStr = String(clamped);
            onChange(clampedStr, clamped);
          }
        }
      }
      onBlur?.(e);
    };

    const hasError = Boolean(error || errorMessage);

    return (
      <div className={`relative flex flex-col ${containerClassName}`}>
        {label && <div className="mb-1.5">{label}</div>}

        <div className="relative flex items-center">
          <input
            ref={ref}
            type="text"
            inputMode={resolvedInputMode}
            value={displayValue}
            placeholder={placeholder}
            disabled={disabled}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={`w-full px-3.5 py-2.5 rounded-xl bg-secondary/80 border text-foreground text-sm font-bold transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              hasError
                ? 'border-tomato-brand focus:ring-tomato-brand text-tomato-brand'
                : 'border-border focus:ring-lime-brand'
            } ${unit ? 'pr-12' : ''} ${inputClassName} ${className || ''}`}
            {...rest}
          />

          {unit && (
            <span className="absolute right-3.5 text-xs font-semibold text-muted-foreground select-none pointer-events-none">
              {unit}
            </span>
          )}
        </div>

        {errorMessage && (
          <span className="mt-1 text-[11px] font-semibold text-tomato-brand">
            {errorMessage}
          </span>
        )}
      </div>
    );
  }
);

NumberField.displayName = 'NumberField';
