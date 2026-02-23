import type { TimeEntry } from '../types';

const toMinutes = (time: string): number | null => {
  const [hours, minutes] = time.split(':').map(Number);
  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
};

export interface Duration {
  minutesTotal: number;
  hours: number;
  minutes: number;
}

const parseDateString = (value: string): Date | null => {
  const parts = value.split('-');
  if (parts.length !== 3) {
    return null;
  }

  const [yearStr, monthStr, dayStr] = parts;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toISODate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const minutesToDurationInternal = (minutesTotal: number): Duration => {
  const safeTotal = Math.max(0, Math.floor(minutesTotal));
  return {
    minutesTotal: safeTotal,
    hours: Math.floor(safeTotal / 60),
    minutes: safeTotal % 60,
  };
};

export const minutesToDuration = (minutesTotal: number): Duration => {
  return minutesToDurationInternal(minutesTotal);
};

export const calculateDuration = (timeIn: string, timeOut: string): Duration => {
  const start = toMinutes(timeIn);
  const end = toMinutes(timeOut);

  if (start === null || end === null) {
    return { minutesTotal: 0, hours: 0, minutes: 0 };
  }

  const diff = Math.max(0, end - start);
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;

  return {
    minutesTotal: diff,
    hours,
    minutes,
  };
};

export const formatDuration = (duration: Duration): string => {
  if (duration.minutesTotal === 0) {
    return '0m';
  }

  const parts: string[] = [];
  if (duration.hours > 0) {
    parts.push(`${duration.hours}h`);
  }

  if (duration.minutes > 0) {
    parts.push(`${duration.minutes}m`);
  }

  if (parts.length === 0) {
    return '0m';
  }

  return parts.join(' ');
};

export const formatDate = (date: string): string => {
  try {
    const parsed = parseDateString(date);
    if (!parsed) {
      return date;
    }

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    }).format(parsed);
  } catch {
    return date;
  }
};

export const formatTimeRange = (timeIn: string, timeOut: string): string => {
  return `${timeIn || '--:--'} - ${timeOut || '--:--'}`;
};

export const sortEntriesNewestFirst = (entries: TimeEntry[]): TimeEntry[] => {
  const safeTimestamp = (value?: string): number | null => {
    if (!value) {
      return null;
    }
    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? null : timestamp;
  };

  const resolveEntryTimestamp = (entry: TimeEntry): number => {
    const baseDate = entry.date;
    const baseTime = entry.timeOut || entry.timeIn;

    if (baseDate && baseTime) {
      const composed = `${baseDate}T${baseTime}`;
      const composedTs = safeTimestamp(composed);
      if (composedTs !== null) {
        return composedTs;
      }
    }

    if (baseDate) {
      const composedTs = safeTimestamp(`${baseDate}T00:00`);
      if (composedTs !== null) {
        return composedTs;
      }
    }

    const createdAtTs = safeTimestamp(entry.createdAt);
    if (createdAtTs !== null) {
      return createdAtTs;
    }

    return 0;
  };

  return [...entries].sort((a, b) => {
    const aTime = resolveEntryTimestamp(a);
    const bTime = resolveEntryTimestamp(b);
    return bTime - aTime;
  });
};

export const getWeekBounds = (isoDate: string): { weekStart: string; weekEnd: string } | null => {
  const date = parseDateString(isoDate);
  if (!date) {
    return null;
  }

  const start = new Date(date);
  const day = start.getDay(); // 0 (Sunday) ... 6 (Saturday)
  const diff = (day + 6) % 7; // days since Monday
  start.setDate(start.getDate() - diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return {
    weekStart: toISODate(start),
    weekEnd: toISODate(end),
  };
};

const WEEKLY_TARGET_MINUTES = 20 * 60;
export const DEFAULT_HOURLY_RATE = 18;

const getHourlyRateForCourse = (courseName: string | undefined, rates: Record<string, number>): number => {
  const trimmed = courseName?.trim();
  if (!trimmed) {
    return DEFAULT_HOURLY_RATE;
  }

  const rate = rates[trimmed];
  if (typeof rate === 'number' && Number.isFinite(rate) && rate >= 0) {
    return rate;
  }

  return DEFAULT_HOURLY_RATE;
};

export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  totalMinutes: number;
  sessionCount: number;
  pendingMinutes: number;
  projectedEarnings: number;
}

export const calculateWeeklyStats = (
  entries: TimeEntry[],
  courseRates: Record<string, number>,
): WeeklyStats[] => {
  const totals = new Map<
    string,
    { weekStart: string; weekEnd: string; totalMinutes: number; sessionCount: number; earnings: number }
  >();

  entries.forEach((entry) => {
    if (!entry.date) {
      return;
    }

    const bounds = getWeekBounds(entry.date);
    if (!bounds) {
      return;
    }

    const weekKey = bounds.weekStart;
    const existing = totals.get(weekKey) ?? {
      weekStart: bounds.weekStart,
      weekEnd: bounds.weekEnd,
      totalMinutes: 0,
      sessionCount: 0,
      earnings: 0,
    };

    const duration = calculateDuration(entry.timeIn, entry.timeOut);
    const rate = getHourlyRateForCourse(entry.courseName, courseRates);

    existing.totalMinutes += duration.minutesTotal;
    existing.sessionCount += 1;
    existing.earnings += (duration.minutesTotal / 60) * rate;

    totals.set(weekKey, existing);
  });

  const stats: WeeklyStats[] = Array.from(totals.values()).map((value) => {
    const pendingMinutes = Math.max(0, WEEKLY_TARGET_MINUTES - value.totalMinutes);
    return {
      weekStart: value.weekStart,
      weekEnd: value.weekEnd,
      totalMinutes: value.totalMinutes,
      sessionCount: value.sessionCount,
      pendingMinutes,
      projectedEarnings: value.earnings,
    };
  });

  stats.sort((a, b) => (a.weekStart < b.weekStart ? 1 : -1));
  return stats;
};

export const calculateCumulativeStats = (entries: TimeEntry[], courseRates: Record<string, number>) => {
  return entries.reduce(
    (acc, entry) => {
      const duration = calculateDuration(entry.timeIn, entry.timeOut);
      const rate = getHourlyRateForCourse(entry.courseName, courseRates);
      const earnings = (duration.minutesTotal / 60) * rate;

      return {
        totalMinutes: acc.totalMinutes + duration.minutesTotal,
        sessionCount: acc.sessionCount + 1,
        totalEarnings: acc.totalEarnings + earnings,
      };
    },
    { totalMinutes: 0, sessionCount: 0, totalEarnings: 0 },
  );
};

export const formatWeekRange = (weekStart: string, weekEnd: string): string => {
  const start = parseDateString(weekStart);
  const end = parseDateString(weekEnd);

  if (!start || !end) {
    return `${weekStart} - ${weekEnd}`;
  }

  const monthDayFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const startLabel = monthDayFormatter.format(start);
  const endLabel = monthDayFormatter.format(end);
  const yearLabel = end.getFullYear();

  return `${startLabel} – ${endLabel}, ${yearLabel}`;
};
