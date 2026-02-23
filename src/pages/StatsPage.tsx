import { useEffect, useMemo, useState } from 'react';
import { getEntries } from '../lib/storage';
import {
  calculateCumulativeStats,
  calculateWeeklyStats,
  formatDuration,
  formatWeekRange,
  minutesToDuration,
  sortEntriesNewestFirst,
} from '../lib/utils';
import type { TimeEntry } from '../types';
import type { WeeklyStats } from '../lib/utils';
import { useEarningsVisibility } from '../context/EarningsVisibilityContext';
import { useCourseRates } from '../context/CourseRatesContext';

const SummaryMetric = ({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}): JSX.Element => (
  <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5 shadow-inner">
    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">{label}</p>
    <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
    {helper ? <p className="mt-1 text-xs text-neutral-500">{helper}</p> : null}
  </div>
);

const WeeklyStatsCard = ({
  stats,
  showEarnings,
}: {
  stats: WeeklyStats;
  showEarnings: boolean;
}): JSX.Element => {
  const workedLabel = formatDuration(minutesToDuration(stats.totalMinutes));
  const pendingLabel = formatDuration(minutesToDuration(stats.pendingMinutes));
  const earningsLabel = stats.projectedEarnings.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });

  return (
    <article className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-6 shadow-elevated backdrop-blur">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Week
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">{formatWeekRange(stats.weekStart, stats.weekEnd)}</h2>
        </div>
        <div className="text-sm text-neutral-400">
          Sessions:{' '}
          <span className="font-semibold text-white" aria-label="Sessions this week">
            {stats.sessionCount}
          </span>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryMetric label="Hours Worked" value={workedLabel} helper="Logged duration across all sessions." />
        <SummaryMetric
          label="Sessions"
          value={String(stats.sessionCount)}
          helper="Total entries captured in this week."
        />
        <SummaryMetric
          label="Hours Pending"
          value={pendingLabel}
          helper="Remaining time toward a 20h target."
        />
        <SummaryMetric
          label="Projected Earnings"
          value={showEarnings ? earningsLabel : '••••'}
          helper={showEarnings ? '$18 hourly rate' : ''}
        />
      </div>
    </article>
  );
};

export const StatsPage = (): JSX.Element => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState<boolean>(true);
  const [entriesError, setEntriesError] = useState<string | null>(null);
  const { showEarnings } = useEarningsVisibility();
  const { rates, isLoading: ratesLoading, error: ratesError } = useCourseRates();

  useEffect(() => {
    const loadEntries = async () => {
      try {
        setIsLoadingEntries(true);
        setEntriesError(null);
        const stored = await getEntries();
        setEntries(sortEntriesNewestFirst(stored));
      } catch (error) {
        console.error('[StatsPage] Failed to load entries', error);
        setEntriesError('Failed to load entries.');
      } finally {
        setIsLoadingEntries(false);
      }
    };

    loadEntries();
  }, []);

  const weeklyStats = useMemo(() => calculateWeeklyStats(entries, rates), [entries, rates]);
  const cumulativeStats = useMemo(() => calculateCumulativeStats(entries, rates), [entries, rates]);
  const cumulativeDuration = useMemo(
    () => formatDuration(minutesToDuration(cumulativeStats.totalMinutes)),
    [cumulativeStats.totalMinutes],
  );
  const cumulativeEarningsLabel = useMemo(
    () =>
      cumulativeStats.totalEarnings.toLocaleString(undefined, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }),
    [cumulativeStats.totalEarnings],
  );

  const isLoading = isLoadingEntries || ratesLoading;
  const errorMessage = entriesError ?? ratesError;

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">Weekly Statistics</h1>
          <p className="text-sm text-neutral-400">
            Track weekly performance across hours worked, sessions completed, and remaining hours toward the 20-hour
            target.
          </p>
          {errorMessage ? <p className="text-sm text-rose-400">{errorMessage}</p> : null}
        </header>

        {isLoading ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-8 text-center text-sm text-neutral-400 shadow-inner">
            Loading statistics…
          </div>
        ) : weeklyStats.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/60 p-8 text-center text-sm text-neutral-500 shadow-inner">
            No data yet. Log sessions to see weekly statistics.
          </div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              <SummaryMetric label="Total Hours" value={cumulativeDuration} helper="All logged sessions." />
              <SummaryMetric
                label="Total Sessions"
                value={String(cumulativeStats.sessionCount)}
                helper="Number of tracked entries."
              />
              <SummaryMetric
                label="Total Earnings"
                value={showEarnings ? cumulativeEarningsLabel : '••••'}
                helper={showEarnings ? '$18 hourly rate applied.' : ''}
              />
            </section>

            <div className="space-y-6">
              {weeklyStats.map((stats) => (
                <WeeklyStatsCard key={stats.weekStart} stats={stats} showEarnings={showEarnings} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
};
