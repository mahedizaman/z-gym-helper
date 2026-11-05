/**
 * Scientific Calorie Burn & Metabolic Equations
 * References:
 * - 2011/2024 Compendium of Physical Activities
 * - ACSM (American College of Sports Medicine) Metabolic Equations for Treadmill & Walking/Running
 * - Net Caloric Expenditure: Net kcal = (MET - 1) * weight(kg) * hours
 */

/**
 * Net Calorie Burn (extra calories beyond resting metabolic rate)
 * Formula: Net burn = (MET - 1) * weight(kg) * (durationMin / 60)
 */
export function calculateNetBurn(
  met: number,
  weightKg: number,
  durationMinutes: number
): number {
  if (met <= 1 || weightKg <= 0 || durationMinutes <= 0) return 0;
  const hours = durationMinutes / 60;
  return Math.round((met - 1) * weightKg * hours);
}

/**
 * Gross Calorie Burn (total calories including baseline resting)
 * Formula: Gross burn = MET * weight(kg) * (durationMin / 60)
 */
export function calculateGrossBurn(
  met: number,
  weightKg: number,
  durationMinutes: number
): number {
  if (met <= 0 || weightKg <= 0 || durationMinutes <= 0) return 0;
  const hours = durationMinutes / 60;
  return Math.round(met * weightKg * hours);
}

/**
 * Calculate speed in km/h given distance in km and duration in minutes
 */
export function calculateSpeedKmh(distanceKm: number, durationMinutes: number): number {
  if (distanceKm <= 0 || durationMinutes <= 0) return 0;
  return Number(((distanceKm / durationMinutes) * 60).toFixed(2));
}

/**
 * Calculate running / walking pace in minutes and seconds per km
 */
export function calculatePace(
  distanceKm: number,
  durationMinutes: number
): { minPerKm: number; formatted: string } {
  if (distanceKm <= 0 || durationMinutes <= 0) {
    return { minPerKm: 0, formatted: '0:00' };
  }
  const minPerKm = durationMinutes / distanceKm;
  const minutes = Math.floor(minPerKm);
  const seconds = Math.round((minPerKm - minutes) * 60);
  const formattedSeconds = seconds === 60 ? '00' : seconds.toString().padStart(2, '0');
  const formattedMinutes = seconds === 60 ? minutes + 1 : minutes;
  return {
    minPerKm: Number(minPerKm.toFixed(2)),
    formatted: `${formattedMinutes}:${formattedSeconds}`,
  };
}

/**
 * Linear interpolation between known data points
 */
function interpolate(
  val: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return y1 + ((val - x1) * (y2 - y1)) / (x2 - x1);
}

/**
 * Compendium speed-to-MET interpolation
 * Walking: 3.0 -> 2.5, 4.5 -> 3.5, 5.5 -> 4.3, 6.5 -> 5.0
 * Running: 8.0 -> 8.3, 9.6 -> 9.8, 11.0 -> 11.0, 12.0 -> 11.8, 13.0 -> 12.8, 14.5 -> 14.5
 * Cycling: 15.0 -> 5.8, 19.0 -> 8.0, 22.0 -> 10.0, 26.0 -> 12.0
 */
export function interpolateSpeedToMet(
  mode: 'walking' | 'running' | 'cycling',
  speedKmh: number
): number {
  if (speedKmh <= 0) return 1.0;

  if (mode === 'walking') {
    if (speedKmh <= 3.0) return 2.5;
    if (speedKmh <= 4.5) return Number(interpolate(speedKmh, 3.0, 2.5, 4.5, 3.5).toFixed(2));
    if (speedKmh <= 5.5) return Number(interpolate(speedKmh, 4.5, 3.5, 5.5, 4.3).toFixed(2));
    if (speedKmh <= 6.5) return Number(interpolate(speedKmh, 5.5, 4.3, 6.5, 5.0).toFixed(2));
    // Above 6.5 km/h is race walking or light jog
    return Number((5.0 + (speedKmh - 6.5) * 0.8).toFixed(2));
  }

  if (mode === 'running') {
    if (speedKmh <= 8.0) return 8.3;
    if (speedKmh <= 9.6) return Number(interpolate(speedKmh, 8.0, 8.3, 9.6, 9.8).toFixed(2));
    if (speedKmh <= 11.0) return Number(interpolate(speedKmh, 9.6, 9.8, 11.0, 11.0).toFixed(2));
    if (speedKmh <= 12.0) return Number(interpolate(speedKmh, 11.0, 11.0, 12.0, 11.8).toFixed(2));
    if (speedKmh <= 13.0) return Number(interpolate(speedKmh, 12.0, 11.8, 13.0, 12.8).toFixed(2));
    if (speedKmh <= 14.5) return Number(interpolate(speedKmh, 13.0, 12.8, 14.5, 14.5).toFixed(2));
    return Number((14.5 + (speedKmh - 14.5) * 0.9).toFixed(2));
  }

  // Cycling
  if (speedKmh <= 15.0) return 5.8;
  if (speedKmh <= 19.0) return Number(interpolate(speedKmh, 15.0, 5.8, 19.0, 8.0).toFixed(2));
  if (speedKmh <= 22.0) return Number(interpolate(speedKmh, 19.0, 8.0, 22.0, 10.0).toFixed(2));
  if (speedKmh <= 26.0) return Number(interpolate(speedKmh, 22.0, 10.0, 26.0, 12.0).toFixed(2));
  return Number((12.0 + (speedKmh - 26.0) * 0.5).toFixed(2));
}

/**
 * ACSM Metabolic Equations for Treadmill with Incline (%)
 * Speed S is converted from km/h to m/min (km/h * 16.6667)
 * Fractional grade G = inclinePercent / 100
 *
 * Running: VO2 (mL/kg/min) = 0.2 * S + 0.9 * S * G + 3.5
 * Walking: VO2 (mL/kg/min) = 0.1 * S + 1.8 * S * G + 3.5
 *
 * Energy expenditure:
 * Gross kcal = VO2 * weightKg * durationMin * 5 / 1000
 * Net kcal = (VO2 - 3.5) * weightKg * durationMin * 5 / 1000
 * Equivalent MET = VO2 / 3.5
 */
export function calculateTreadmillAcsm(
  mode: 'walking' | 'running',
  speedKmh: number,
  inclinePercent: number,
  weightKg: number,
  durationMinutes: number
): {
  vo2: number;
  met: number;
  grossKcal: number;
  netKcal: number;
} {
  if (speedKmh <= 0 || weightKg <= 0 || durationMinutes <= 0) {
    return { vo2: 0, met: 1, grossKcal: 0, netKcal: 0 };
  }

  const speedMPerMin = speedKmh * (1000 / 60); // 16.66667
  const grade = Math.max(0, inclinePercent) / 100;

  let vo2 = 3.5;
  if (mode === 'running') {
    vo2 = 0.2 * speedMPerMin + 0.9 * speedMPerMin * grade + 3.5;
  } else {
    vo2 = 0.1 * speedMPerMin + 1.8 * speedMPerMin * grade + 3.5;
  }

  const met = Number((vo2 / 3.5).toFixed(2));
  const grossKcal = Math.round((vo2 * weightKg * durationMinutes * 5) / 1000);
  const netKcal = Math.round(((vo2 - 3.5) * weightKg * durationMinutes * 5) / 1000);

  return {
    vo2: Number(vo2.toFixed(2)),
    met,
    grossKcal,
    netKcal: Math.max(0, netKcal),
  };
}

/**
 * Strength Mode active time estimator:
 * Active lifting time = sets * reps * 4s
 * Rest time = sets * rest_s
 * Total estimated minutes = (active + rest) / 60
 */
export function calculateStrengthActiveMinutes(
  sets: number,
  reps: number,
  restSeconds: number
): number {
  if (sets <= 0) return 0;
  const workSeconds = sets * Math.max(1, reps) * 4;
  const restSec = Math.max(0, sets - 1) * Math.max(0, restSeconds);
  const totalSeconds = workSeconds + restSec;
  return Math.max(1, Math.round(totalSeconds / 60));
}

/**
 * Daily Plan Target & Deficit Split
 * Energy balance: 1 kg body fat ~ 7700 kcal
 * Default splitRatio: 0.7 (70% diet deficit, 30% exercise burn)
 */
export function calculateDailyPlanSplit(
  tdee: number,
  weeklyGoalKg: number, // positive for gain, negative for loss, 0 for maintain
  splitRatio: number = 0.7, // 0.5 to 1.0
  gender: 'male' | 'female' = 'male'
): {
  dailyCalorieDelta: number;
  dietTargetKcal: number;
  targetWorkoutBurnKcal: number;
  isFloorEnforced: boolean;
  isUnsafePace: boolean;
  safeFloor: number;
} {
  const safeFloor = gender === 'female' ? 1200 : 1500;
  const isUnsafePace = Math.abs(weeklyGoalKg) > 1.0;

  // Total daily calorie shift required: (weeklyGoalKg * 7700) / 7
  const dailyShift = Math.round((weeklyGoalKg * 7700) / 7);

  if (weeklyGoalKg === 0) {
    return {
      dailyCalorieDelta: 0,
      dietTargetKcal: tdee,
      targetWorkoutBurnKcal: 250, // healthy maintenance activity baseline
      isFloorEnforced: false,
      isUnsafePace: false,
      safeFloor,
    };
  }

  if (weeklyGoalKg < 0) {
    // Weight loss deficit
    const totalDeficit = Math.abs(dailyShift);
    const clampedSplit = Math.max(0, Math.min(1, splitRatio));

    const proposedDietDeficit = Math.round(totalDeficit * clampedSplit);
    const proposedBurn = Math.round(totalDeficit * (1 - clampedSplit));

    let dietTargetKcal = tdee - proposedDietDeficit;
    let isFloorEnforced = false;

    if (dietTargetKcal < safeFloor) {
      dietTargetKcal = safeFloor;
      isFloorEnforced = true;
    }

    return {
      dailyCalorieDelta: -totalDeficit,
      dietTargetKcal,
      targetWorkoutBurnKcal: Math.max(150, proposedBurn),
      isFloorEnforced,
      isUnsafePace,
      safeFloor,
    };
  }

  // Weight gain surplus
  const surplus = dailyShift;
  return {
    dailyCalorieDelta: surplus,
    dietTargetKcal: tdee + surplus,
    targetWorkoutBurnKcal: 200, // keep cardiovascular baseline
    isFloorEnforced: false,
    isUnsafePace,
    safeFloor,
  };
}
