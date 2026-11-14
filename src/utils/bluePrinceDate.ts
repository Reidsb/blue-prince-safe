export interface SafeDateResult {
  inGameDay: number;
  daysElapsed: number;
  year: number;
  monthIndex: number; // 0-11
  monthNumber: number; // 1-12
  monthName: string;
  monthShort: string;
  dayOfMonth: number; // 1-31
  paddedMonth: string; // "01" - "12"
  paddedDay: string; // "01" - "31"
  fullFormatted: string; // "November 7, 1993"
  slashMMDDYYYY: string; // "11 / 07 / 1993"
  compactMMDDYYYY: string; // "11/07/1993"
  fourDigitMMDD: string; // "1107"
  fourDigitDDMM: string; // "0711"
  isoDate: string; // "1993-11-07"
  loreDayOfWeek: string; // In Blue Prince lore, Day 1 (Nov 7, 1993) or calendar weekday
  calendarDayOfWeek: string;
}

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const MONTH_SHORT_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

// Campaign Day 1 in Blue Prince always starts on November 7, 1993.
const CAMPAIGN_START_UTC = Date.UTC(1993, 10, 7);
const MS_PER_DAY = 86_400_000;

export function clampDay(day: number): number {
  if (!Number.isFinite(day)) return 1;
  return Math.max(1, Math.min(9999, Math.floor(day)));
}

export function calculateSafeDate(rawDay: number): SafeDateResult {
  const inGameDay = clampDay(rawDay);
  const daysElapsed = inGameDay - 1;
  const targetUtc = new Date(CAMPAIGN_START_UTC + daysElapsed * MS_PER_DAY);

  const year = targetUtc.getUTCFullYear();
  const monthIndex = targetUtc.getUTCMonth();
  const monthNumber = monthIndex + 1;
  const dayOfMonth = targetUtc.getUTCDate();
  const weekdayIndex = targetUtc.getUTCDay();

  const monthName = MONTH_NAMES[monthIndex];
  const monthShort = MONTH_SHORT_NAMES[monthIndex];
  const paddedMonth = String(monthNumber).padStart(2, "0");
  const paddedDay = String(dayOfMonth).padStart(2, "0");

  return {
    inGameDay,
    daysElapsed,
    year,
    monthIndex,
    monthNumber,
    monthName,
    monthShort,
    dayOfMonth,
    paddedMonth,
    paddedDay,
    fullFormatted: `${monthName} ${dayOfMonth}, ${year}`,
    slashMMDDYYYY: `${paddedMonth} / ${paddedDay} / ${year}`,
    compactMMDDYYYY: `${paddedMonth}/${paddedDay}/${year}`,
    fourDigitMMDD: `${paddedMonth}${paddedDay}`,
    fourDigitDDMM: `${paddedDay}${paddedMonth}`,
    isoDate: `${year}-${paddedMonth}-${paddedDay}`,
    loreDayOfWeek: WEEKDAY_NAMES[weekdayIndex],
    calendarDayOfWeek: WEEKDAY_NAMES[weekdayIndex],
  };
}

/**
 * Given a calendar year, month (1-12), and day (1-31), returns the Blue Prince
 * in-game Day number (where Nov 7, 1993 = Day 1), or null if before Nov 7, 1993
 * or an invalid calendar date.
 */
export function dateToInGameDay(
  year: number,
  monthNumber: number,
  dayOfMonth: number
): number | null {
  if (monthNumber < 1 || monthNumber > 12 || dayOfMonth < 1 || dayOfMonth > 31) {
    return null;
  }
  const candidate = new Date(Date.UTC(year, monthNumber - 1, dayOfMonth));
  // Verify no overflow occurred (e.g., Nov 31 -> Dec 1)
  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== monthNumber - 1 ||
    candidate.getUTCDate() !== dayOfMonth
  ) {
    return null;
  }

  const diffDays = Math.round(
    (candidate.getTime() - CAMPAIGN_START_UTC) / MS_PER_DAY
  );
  if (diffDays < 0) {
    return null;
  }
  return diffDays + 1;
}

export function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

export function getFirstWeekdayOfMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
}

export interface TimeRecommendation {
  estimatedInGameMinutesFromMidnight: number; // e.g. 8:00 AM = 480
  estimatedClockLabel: string; // e.g. "8:30 AM"
  recommendedHour24: number; // e.g. 10
  recommendedLabel12h: string; // e.g. "10:00 AM"
  recommendedLabel24h: string; // e.g. "10:00"
  windowEndLabel12h: string; // +4 in-game hours
  realSecondsToWait: number; // 1 in-game hour = 5 real minutes = 300 real seconds
  rollsIntoNextDay: boolean;
}

export function formatMinutesAs12Hour(totalMinutes: number): string {
  const normalized = ((Math.floor(totalMinutes) % 1440) + 1440) % 1440;
  const hour24 = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(mins).padStart(2, "0")} ${period}`;
}

/**
 * Every run in Blue Prince starts at 8:00 AM (480 mins).
 * Roughly 5 real-world minutes = 1 in-game hour (5 real seconds = 1 in-game minute).
 * The Shelter Time-Lock Safe requires an unlock hour at least 1 full hour ahead
 * of the current in-game time. To avoid missing the tick while entering the code,
 * we ensure at least 75 in-game minutes ahead when rounding to whole terminal hours.
 */
export function calculateUnlockTime(
  realMinutesElapsedInRun: number
): TimeRecommendation {
  const clampedRealMins = Math.max(0, Math.min(90, realMinutesElapsedInRun));
  // 5 real mins = 60 in-game mins => 1 real min = 12 in-game mins
  const inGameMinsElapsed = Math.round(clampedRealMins * 12);
  const currentInGameMins = 8 * 60 + inGameMinsElapsed; // starts 8:00 AM

  // Terminal accepts whole-hour selections and requires > 60 in-game minutes ahead.
  // Adding 75 in-game minutes and rounding up to the next hour guarantees >= 1h15m lead,
  // or if exact hour + 2h at 8:00 AM -> 10:00 AM (the community-proven reliable setting).
  const minTargetMins = currentInGameMins + 72;
  const recommendedHourUnbounded = Math.ceil(minTargetMins / 60);
  const rollsIntoNextDay = recommendedHourUnbounded >= 24;
  const recommendedHour24 = recommendedHourUnbounded % 24;

  const targetInGameMins = recommendedHourUnbounded * 60;
  const inGameMinsToWait = Math.max(0, targetInGameMins - currentInGameMins);
  // 1 in-game min = 5 real seconds
  const realSecondsToWait = inGameMinsToWait * 5;

  return {
    estimatedInGameMinutesFromMidnight: currentInGameMins,
    estimatedClockLabel: formatMinutesAs12Hour(currentInGameMins),
    recommendedHour24,
    recommendedLabel12h: formatMinutesAs12Hour(recommendedHour24 * 60),
    recommendedLabel24h: `${String(recommendedHour24).padStart(2, "0")}:00`,
    windowEndLabel12h: formatMinutesAs12Hour((recommendedHour24 + 4) * 60),
    realSecondsToWait,
    rollsIntoNextDay,
  };
}
