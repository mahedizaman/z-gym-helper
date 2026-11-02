import { describe, it, expect } from 'vitest';
import {
  calculateBMR,
  calculateTDEE,
  calculateBMI,
  calculateExerciseBurn,
  calculateWeightDelta,
  calculateStreak,
  getDhakaDateString,
} from './calculations';

describe('Domain Math & Health Calculations', () => {
  it('correctly calculates Mifflin-St Jeor BMR for male and female', () => {
    // 70kg, 175cm, 25y male: 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75 -> 1674
    const maleBmr = calculateBMR({
      weightKg: 70,
      heightCm: 175,
      age: 25,
      gender: 'male',
    });
    expect(maleBmr).toBe(1674);

    // 60kg, 160cm, 30y female: 10*60 + 6.25*160 - 5*30 - 161 = 600 + 1000 - 150 - 161 = 1289
    const femaleBmr = calculateBMR({
      weightKg: 60,
      heightCm: 160,
      age: 30,
      gender: 'female',
    });
    expect(femaleBmr).toBe(1289);
  });

  it('correctly calculates TDEE with activity multipliers', () => {
    const bmr = 1674;
    expect(calculateTDEE(bmr, 'sedentary')).toBe(Math.round(1674 * 1.2)); // 2009
    expect(calculateTDEE(bmr, 'moderate')).toBe(Math.round(1674 * 1.55)); // 2595
  });

  it('correctly calculates BMI and classifies weight category', () => {
    // 70kg at 175cm: BMI = 70 / (1.75 * 1.75) = 22.86 -> 22.9 (normal)
    const normalResult = calculateBMI(70, 175);
    expect(normalResult.bmi).toBe(22.9);
    expect(normalResult.category).toBe('normal');

    // 95kg at 175cm: BMI = 95 / (1.75 * 1.75) = 31.02 -> 31.0 (obese)
    const obeseResult = calculateBMI(95, 175);
    expect(obeseResult.bmi).toBe(31.0);
    expect(obeseResult.category).toBe('obese');

    // 48kg at 170cm: BMI = 48 / (1.7 * 1.7) = 16.6 (underweight)
    const underResult = calculateBMI(48, 170);
    expect(underResult.bmi).toBe(16.6);
    expect(underResult.category).toBe('underweight');
  });

  it('correctly estimates MET exercise burn', () => {
    // 70kg doing 6.0 MET exercise for 45 minutes: 6 * 70 * (45/60) = 315 kcal
    const burn = calculateExerciseBurn(6.0, 70, 45);
    expect(burn).toBe(315);
  });

  it('calculates weight change delta and percentage', () => {
    // 80kg to 76kg -> -4kg (-5%)
    const loss = calculateWeightDelta(80, 76);
    expect(loss.deltaKg).toBe(-4);
    expect(loss.percentageChange).toBe(-5);
    expect(loss.isLoss).toBe(true);

    // 60kg to 63kg -> +3kg (+5%)
    const gain = calculateWeightDelta(60, 63);
    expect(gain.deltaKg).toBe(3);
    expect(gain.percentageChange).toBe(5);
    expect(gain.isLoss).toBe(false);
  });

  it('computes Asia/Dhaka streak accurately', () => {
    const fixedNow = new Date('2026-11-03T12:00:00+06:00');
    const today = getDhakaDateString(fixedNow); // '2026-11-03'
    const yesterday = '2026-11-02';
    const twoDaysAgo = '2026-11-01';

    // 3 consecutive days including today
    const streakResult = calculateStreak([today, yesterday, twoDaysAgo], fixedNow);
    expect(streakResult.currentStreak).toBe(3);
    expect(streakResult.isActiveToday).toBe(true);

    // active yesterday but not logged today yet -> streak preserved (2 days)
    const streakPreserved = calculateStreak([yesterday, twoDaysAgo], fixedNow);
    expect(streakPreserved.currentStreak).toBe(2);
    expect(streakPreserved.isActiveToday).toBe(false);

    // broken streak (inactive for 2+ days)
    const brokenStreak = calculateStreak([twoDaysAgo], fixedNow);
    expect(brokenStreak.currentStreak).toBe(0);
  });
});
