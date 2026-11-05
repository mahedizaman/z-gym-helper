import { describe, it, expect } from 'vitest';
import {
  calculateNetBurn,
  calculateGrossBurn,
  calculateSpeedKmh,
  calculatePace,
  interpolateSpeedToMet,
  calculateTreadmillAcsm,
  calculateStrengthActiveMinutes,
  calculateDailyPlanSplit,
} from './exercise-burn-math';

describe('Professional Exercise Burn Math', () => {
  describe('Net vs Gross Burn', () => {
    it('calculates Net burn: (MET - 1) * weight * hours', () => {
      // 70 kg person doing 6.0 MET exercise for 60 min
      // Net = (6 - 1) * 70 * 1 = 350 kcal
      const net = calculateNetBurn(6.0, 70, 60);
      expect(net).toBe(350);
    });

    it('calculates Gross burn: MET * weight * hours', () => {
      // 70 kg person doing 6.0 MET exercise for 60 min
      // Gross = 6 * 70 * 1 = 420 kcal
      const gross = calculateGrossBurn(6.0, 70, 60);
      expect(gross).toBe(420);
    });

    it('returns 0 for non-positive values or resting MET <= 1', () => {
      expect(calculateNetBurn(1.0, 70, 45)).toBe(0);
      expect(calculateNetBurn(0, 70, 45)).toBe(0);
      expect(calculateNetBurn(5.0, 0, 45)).toBe(0);
    });
  });

  describe('Speed & Pace Calculations', () => {
    it('calculates speed in km/h accurately', () => {
      // 5 km in 30 minutes = 10 km/h
      expect(calculateSpeedKmh(5, 30)).toBe(10);
      // 10 km in 45 minutes = 13.33 km/h
      expect(calculateSpeedKmh(10, 45)).toBe(13.33);
    });

    it('calculates pace in min/km format correctly', () => {
      // 5 km in 30 minutes -> 6:00 min/km
      const pace1 = calculatePace(5, 30);
      expect(pace1.formatted).toBe('6:00');
      expect(pace1.minPerKm).toBe(6);

      // 5 km in 27.5 minutes -> 5:30 min/km
      const pace2 = calculatePace(5, 27.5);
      expect(pace2.formatted).toBe('5:30');
    });
  });

  describe('Compendium Speed-to-MET Interpolation', () => {
    it('interpolates walking speed correctly', () => {
      expect(interpolateSpeedToMet('walking', 3.0)).toBe(2.5);
      expect(interpolateSpeedToMet('walking', 4.5)).toBe(3.5);
      expect(interpolateSpeedToMet('walking', 5.5)).toBe(4.3);
      expect(interpolateSpeedToMet('walking', 6.5)).toBe(5.0);
      // Midpoint between 4.5 and 5.5: 5.0 km/h -> 3.5 + 0.5 * 0.8 = 3.9
      expect(interpolateSpeedToMet('walking', 5.0)).toBeCloseTo(3.9, 1);
    });

    it('interpolates running speed correctly', () => {
      expect(interpolateSpeedToMet('running', 8.0)).toBe(8.3);
      expect(interpolateSpeedToMet('running', 9.6)).toBe(9.8);
      expect(interpolateSpeedToMet('running', 11.0)).toBe(11.0);
      expect(interpolateSpeedToMet('running', 12.0)).toBe(11.8);
      expect(interpolateSpeedToMet('running', 13.0)).toBe(12.8);
      expect(interpolateSpeedToMet('running', 14.5)).toBe(14.5);
    });

    it('interpolates cycling speed correctly', () => {
      expect(interpolateSpeedToMet('cycling', 15.0)).toBe(5.8);
      expect(interpolateSpeedToMet('cycling', 19.0)).toBe(8.0);
      expect(interpolateSpeedToMet('cycling', 22.0)).toBe(10.0);
      expect(interpolateSpeedToMet('cycling', 26.0)).toBe(12.0);
    });
  });

  describe('ACSM Treadmill Incline Equations', () => {
    it('computes flat and inclined running accurately', () => {
      // 70 kg runner, 10 km/h on flat (0% incline) for 30 min
      // S = 10 * 16.6667 = 166.67 m/min
      // VO2 = 0.2 * 166.67 + 3.5 = 36.83 mL/kg/min
      // MET = 36.83 / 3.5 = 10.52
      const flat = calculateTreadmillAcsm('running', 10, 0, 70, 30);
      expect(flat.vo2).toBeCloseTo(36.83, 0);
      expect(flat.met).toBeCloseTo(10.52, 0);
      expect(flat.grossKcal).toBeGreaterThan(flat.netKcal);

      // Now add 5% incline: VO2 should increase by 0.9 * S * 0.05 = 7.5
      const incline5 = calculateTreadmillAcsm('running', 10, 5, 70, 30);
      expect(incline5.vo2).toBeGreaterThan(flat.vo2);
      expect(incline5.netKcal).toBeGreaterThan(flat.netKcal);
    });

    it('computes inclined walking accurately', () => {
      // 70 kg walker, 5 km/h on 4% incline for 45 min
      const walk = calculateTreadmillAcsm('walking', 5, 4, 70, 45);
      expect(walk.met).toBeGreaterThan(3.0);
      expect(walk.netKcal).toBeGreaterThan(0);
    });
  });

  describe('Strength Active Time Estimator', () => {
    it('estimates active time from sets, reps and rest', () => {
      // 4 sets x 10 reps (40 reps * 4s = 160s) + 3 rests * 90s (270s) = 430s ~ 7 minutes
      const mins = calculateStrengthActiveMinutes(4, 10, 90);
      expect(mins).toBe(7);
    });
  });

  describe('Daily Plan Deficit Split & Clinical Floors', () => {
    it('splits 0.5 kg/week loss (550 kcal/day deficit) with 70/30 ratio', () => {
      // TDEE 2200
      // Deficit = 550 kcal
      // Diet cut = 550 * 0.7 = 385 -> diet target = 1815 kcal
      // Workout burn target = 550 * 0.3 = 165 kcal
      const plan = calculateDailyPlanSplit(2200, -0.5, 0.7, 'male');
      expect(plan.dietTargetKcal).toBe(1815);
      expect(plan.targetWorkoutBurnKcal).toBe(165);
      expect(plan.isFloorEnforced).toBe(false);
      expect(plan.isUnsafePace).toBe(false);
    });

    it('enforces clinical safe floor (1500 for male, 1200 for female)', () => {
      // Low TDEE (1600), aggressive cut for male -> would hit 1050 without floor
      const malePlan = calculateDailyPlanSplit(1600, -0.75, 0.8, 'male');
      expect(malePlan.dietTargetKcal).toBe(1500);
      expect(malePlan.isFloorEnforced).toBe(true);

      const femalePlan = calculateDailyPlanSplit(1300, -0.75, 0.8, 'female');
      expect(femalePlan.dietTargetKcal).toBe(1200);
      expect(femalePlan.isFloorEnforced).toBe(true);
    });

    it('flags unsafe weight loss pace (> 1.0 kg/week)', () => {
      const aggressive = calculateDailyPlanSplit(2400, -1.25, 0.7, 'male');
      expect(aggressive.isUnsafePace).toBe(true);
    });
  });
});
