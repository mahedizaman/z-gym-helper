import { describe, it, expect } from 'vitest';
import {
  calculatePeriodSummary,
  formatDayLabel,
  type DailySummaryItem,
  type PeriodWeightLog,
} from './period-summary-math';

describe('period-summary-math', () => {
  it('formats day labels cleanly in Bengali and English', () => {
    expect(formatDayLabel('2026-11-06', 'bn')).toBe('6 নভে');
    expect(formatDayLabel('2026-11-06', 'en')).toBe('Nov 6');
    expect(formatDayLabel('2026-03-01', 'bn')).toBe('1 মার্চ');
  });

  it('computes daily averages strictly over LOGGED days only and never divides by unlogged days', () => {
    // 7 days period, but only 2 days logged
    const summaries: DailySummaryItem[] = [
      {
        date: '2026-11-01',
        totalIntakeKcal: 2000,
        totalProtein: 100,
        totalCarbs: 250,
        totalFat: 60,
        totalFiber: 25,
        exerciseBurnKcal: 200,
        targetKcal: 2000,
        logged: true,
      },
      {
        date: '2026-11-02',
        totalIntakeKcal: 2200,
        totalProtein: 110,
        totalCarbs: 270,
        totalFat: 65,
        totalFiber: 30,
        exerciseBurnKcal: 300,
        targetKcal: 2000,
        logged: true,
      },
      {
        date: '2026-11-03',
        totalIntakeKcal: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalFiber: 0,
        exerciseBurnKcal: 0,
        targetKcal: 2000,
        logged: false,
      },
      {
        date: '2026-11-04',
        totalIntakeKcal: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalFiber: 0,
        exerciseBurnKcal: 0,
        targetKcal: 2000,
        logged: false,
      },
      {
        date: '2026-11-05',
        totalIntakeKcal: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalFiber: 0,
        exerciseBurnKcal: 0,
        targetKcal: 2000,
        logged: false,
      },
      {
        date: '2026-11-06',
        totalIntakeKcal: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalFiber: 0,
        exerciseBurnKcal: 0,
        targetKcal: 2000,
        logged: false,
      },
      {
        date: '2026-11-07',
        totalIntakeKcal: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalFiber: 0,
        exerciseBurnKcal: 0,
        targetKcal: 2000,
        logged: false,
      },
    ];

    const result = calculatePeriodSummary({
      periodDays: 7,
      summaries,
      fallbackTargetKcal: 2000,
    });

    expect(result.periodDays).toBe(7);
    expect(result.loggedDaysCount).toBe(2);
    // Totals
    expect(result.totalCalories).toBe(4200);
    expect(result.totalProtein).toBe(210);
    expect(result.totalBurn).toBe(500);

    // Daily averages should be divided by 2, NOT by 7!
    expect(result.dailyAverage.calories).toBe(2100); // 4200 / 2
    expect(result.dailyAverage.protein).toBe(105); // 210 / 2
    expect(result.dailyAverage.burn).toBe(250); // 500 / 2

    // Low logging flagged because 2 < ceil(7/2) = 4
    expect(result.isLowLogging).toBe(true);
  });

  it('accurately sums targets when targets change over time', () => {
    // 3 days where user adjusted their target each day
    const summaries: DailySummaryItem[] = [
      {
        date: '2026-11-04',
        totalIntakeKcal: 1800,
        totalProtein: 90,
        totalCarbs: 200,
        totalFat: 50,
        totalFiber: 20,
        exerciseBurnKcal: 100,
        targetKcal: 1800,
        logged: true,
      },
      {
        date: '2026-11-05',
        totalIntakeKcal: 2100,
        totalProtein: 105,
        totalCarbs: 240,
        totalFat: 58,
        totalFiber: 25,
        exerciseBurnKcal: 200,
        targetKcal: 2000,
        logged: true,
      },
      {
        date: '2026-11-06',
        totalIntakeKcal: 2300,
        totalProtein: 120,
        totalCarbs: 260,
        totalFat: 62,
        totalFiber: 28,
        exerciseBurnKcal: 150,
        targetKcal: 2200,
        logged: true,
      },
    ];

    const result = calculatePeriodSummary({
      periodDays: 3,
      summaries,
    });

    expect(result.loggedDaysCount).toBe(3);
    // Target sum: 1800 + 2000 + 2200 = 6000
    expect(result.loggedTargetKcal).toBe(6000);
    expect(result.totalPeriodTargetKcal).toBe(6000);
    // Total intake: 1800 + 2100 + 2300 = 6200
    expect(result.totalCalories).toBe(6200);
    // Percent of target: 6200 / 6000 * 100 = 103%
    expect(result.percentOfTarget).toBe(103);
    // Average target: 6000 / 3 = 2000
    expect(result.dailyAverage.targetKcal).toBe(2000);
    // Average intake: 6200 / 3 = 2067
    expect(result.dailyAverage.calories).toBe(2067);
    expect(result.diffKcal).toBe(67);
  });

  it('computes net balance and estimated weight change using 7700 kcal per kg', () => {
    // 3 days with a deficit
    // Intake = 5000 kcal, Target = 6000 kcal, Extra burn = 540 kcal
    // Net balance = 5000 - (6000 + 540) = -1540 kcal
    // Estimated weight change = -1540 / 7700 = -0.20 kg
    const summaries: DailySummaryItem[] = [
      {
        date: '2026-11-04',
        totalIntakeKcal: 1700,
        totalProtein: 90,
        totalCarbs: 200,
        totalFat: 50,
        totalFiber: 20,
        exerciseBurnKcal: 200,
        targetKcal: 2000,
        logged: true,
      },
      {
        date: '2026-11-05',
        totalIntakeKcal: 1600,
        totalProtein: 85,
        totalCarbs: 190,
        totalFat: 48,
        totalFiber: 18,
        exerciseBurnKcal: 140,
        targetKcal: 2000,
        logged: true,
      },
      {
        date: '2026-11-06',
        totalIntakeKcal: 1700,
        totalProtein: 95,
        totalCarbs: 205,
        totalFat: 52,
        totalFiber: 22,
        exerciseBurnKcal: 200,
        targetKcal: 2000,
        logged: true,
      },
    ];

    const weightLogs: PeriodWeightLog[] = [
      { date: '2026-11-04', weightKg: 72.5 },
      { date: '2026-11-06', weightKg: 72.2 },
    ];

    const result = calculatePeriodSummary({
      periodDays: 3,
      summaries,
      weightLogs,
    });

    expect(result.netBalanceKcal).toBe(-1540);
    expect(result.estimatedWeightChangeKg).toBe(-0.2);
    expect(result.realWeightChangeKg).toBe(-0.3); // 72.2 - 72.5
  });

  it('handles completely empty periods without dividing by zero or crashing', () => {
    const emptySummaries: DailySummaryItem[] = [
      {
        date: '2026-11-01',
        totalIntakeKcal: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalFiber: 0,
        exerciseBurnKcal: 0,
        targetKcal: 2000,
        logged: false,
      },
      {
        date: '2026-11-02',
        totalIntakeKcal: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalFiber: 0,
        exerciseBurnKcal: 0,
        targetKcal: 2000,
        logged: false,
      },
      {
        date: '2026-11-03',
        totalIntakeKcal: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalFiber: 0,
        exerciseBurnKcal: 0,
        targetKcal: 2000,
        logged: false,
      },
    ];

    const result = calculatePeriodSummary({
      periodDays: 3,
      summaries: emptySummaries,
      fallbackTargetKcal: 2000,
    });

    expect(result.loggedDaysCount).toBe(0);
    expect(result.totalCalories).toBe(0);
    expect(result.dailyAverage.calories).toBe(0);
    expect(result.dailyAverage.protein).toBe(0);
    expect(result.percentOfTarget).toBe(0);
    expect(result.isLowLogging).toBe(false);
    expect(result.insights.bn[0]).toContain('এখনও কোনো খাবার বা ব্যায়াম লগ করা হয়নি');
    expect(result.insights.en[0]).toContain('No meals or workouts logged');
  });

  it('handles 30-day edge cases properly', () => {
    const thirtyDays: DailySummaryItem[] = [];
    for (let i = 1; i <= 30; i++) {
      const dayStr = i < 10 ? `0${i}` : `${i}`;
      const isLogged = i % 2 === 0; // 15 logged days
      thirtyDays.push({
        date: `2026-10-${dayStr}`,
        totalIntakeKcal: isLogged ? 2000 : 0,
        totalProtein: isLogged ? 100 : 0,
        totalCarbs: isLogged ? 250 : 0,
        totalFat: isLogged ? 60 : 0,
        totalFiber: isLogged ? 28 : 0,
        exerciseBurnKcal: isLogged ? 300 : 0,
        targetKcal: 2000,
        logged: isLogged,
      });
    }

    const result = calculatePeriodSummary({
      periodDays: 30,
      summaries: thirtyDays,
      fallbackTargetKcal: 2000,
    });

    expect(result.periodDays).toBe(30);
    expect(result.loggedDaysCount).toBe(15);
    expect(result.isLowLogging).toBe(false); // 15 >= ceil(30/2) = 15
    expect(result.dailyAverage.calories).toBe(2000);
    expect(result.chartData.length).toBe(30);
  });
});
