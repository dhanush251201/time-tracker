import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useCourseRates } from '../context/CourseRatesContext';
import { getEntries } from '../lib/storage';
import type { TimeEntry } from '../types';
import { sortEntriesNewestFirst } from '../lib/utils';

const formatCurrency = (value: number): string =>
  value.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

export const ManagementPage = (): JSX.Element => {
  const { rates, setRate, deleteRate, isLoading: ratesLoading, error: ratesError } = useCourseRates();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [courseInput, setCourseInput] = useState('');
  const [rateInput, setRateInput] = useState('');
  const [pendingRates, setPendingRates] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [entriesError, setEntriesError] = useState<string | null>(null);

  useEffect(() => {
    const loadEntries = async () => {
      try {
        const stored = await getEntries();
        setEntries(sortEntriesNewestFirst(stored));
      } catch (error) {
        console.error('[ManagementPage] Failed to load entries', error);
        setEntriesError('Failed to load entries.');
      }
    };

    loadEntries();
  }, []);

  useEffect(() => {
    setPendingRates(
      Object.keys(rates).reduce<Record<string, string>>((acc, course) => {
        acc[course] = rates[course].toString();
        return acc;
      }, {}),
    );
  }, [rates]);

  const knownCourses = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((entry) => {
      const trimmed = entry.courseName?.trim();
      if (trimmed) {
        set.add(trimmed);
      }
    });
    Object.keys(rates).forEach((course) => set.add(course));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [entries, rates]);

  const missingCourses = useMemo(() => knownCourses.filter((course) => !(course in rates)), [knownCourses, rates]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const courseName = courseInput.trim();
    const parsedRate = Number(rateInput);

    if (!courseName) {
      setErrorMessage('Course name cannot be empty.');
      return;
    }

    if (!Number.isFinite(parsedRate) || parsedRate < 0) {
      setErrorMessage('Hourly rate must be a non-negative number.');
      return;
    }

    try {
      setIsSaving(true);
      await setRate(courseName, parsedRate);
      setCourseInput('');
      setRateInput('');
    } catch (error) {
      console.error('[ManagementPage] Failed to save rate', error);
      setErrorMessage('Failed to save rate.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePendingRateChange = (course: string, value: string) => {
    setPendingRates((prev) => ({ ...prev, [course]: value }));
  };

  const handleSaveRate = async (course: string) => {
    const raw = pendingRates[course];
    const parsedRate = Number(raw);
    if (!Number.isFinite(parsedRate) || parsedRate < 0) {
      setErrorMessage('Hourly rate must be a non-negative number.');
      return;
    }

    setErrorMessage(null);
    try {
      setIsSaving(true);
      await setRate(course, parsedRate);
    } catch (error) {
      console.error('[ManagementPage] Failed to update rate', error);
      setErrorMessage('Failed to update rate.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRate = async (course: string) => {
    try {
      setIsSaving(true);
      await deleteRate(course);
      setPendingRates((prev) => {
        const next = { ...prev };
        delete next[course];
        return next;
      });
    } catch (error) {
      console.error('[ManagementPage] Failed to delete rate', error);
      setErrorMessage('Failed to delete rate.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">Course Rate Management</h1>
          <p className="text-sm text-neutral-400">
            Configure hourly rates per course. These rates are used to project earnings across your timesheet.
          </p>
          {entriesError ? <p className="text-sm text-rose-400">{entriesError}</p> : null}
        </header>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-6 shadow-elevated backdrop-blur">
          <h2 className="text-lg font-semibold text-white">Add or Update Course Rate</h2>
          <p className="mt-1 text-sm text-neutral-400">
            Define a course name and hourly rate to override the default earnings projection.
          </p>
          <form className="mt-4 grid gap-4 md:grid-cols-[2fr_1fr_auto]" onSubmit={handleCreate}>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Course Name</span>
              <input
                type="text"
                value={courseInput}
                onChange={(event) => setCourseInput(event.target.value)}
                placeholder="e.g. CIS 550 - Database Systems"
                className="rounded-xl border border-neutral-800 bg-neutral-950/80 px-4 py-3 text-sm text-neutral-100 shadow-inner placeholder:text-neutral-600 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500/40 disabled:cursor-not-allowed disabled:border-neutral-800 disabled:text-neutral-500"
                disabled={isSaving}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Hourly Rate ($)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={rateInput}
                onChange={(event) => setRateInput(event.target.value)}
                placeholder="18"
                className="rounded-xl border border-neutral-800 bg-neutral-950/80 px-4 py-3 text-sm text-neutral-100 shadow-inner placeholder:text-neutral-600 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500/40 disabled:cursor-not-allowed disabled:border-neutral-800 disabled:text-neutral-500"
                disabled={isSaving}
              />
            </label>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isSaving}
                className="h-fit rounded-2xl bg-neutral-100 px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-black transition hover:bg-neutral-300 focus:outline-none focus:ring-4 focus:ring-neutral-500/40 disabled:cursor-not-allowed disabled:bg-neutral-600 disabled:text-neutral-300 disabled:hover:bg-neutral-600"
              >
                {isSaving ? 'Saving…' : 'Save Rate'}
              </button>
            </div>
          </form>
          {ratesLoading ? <p className="mt-3 text-sm text-neutral-400">Loading course rates…</p> : null}
          {ratesError ? <p className="mt-3 text-sm text-rose-400">{ratesError}</p> : null}
          {errorMessage ? <p className="mt-3 text-sm text-rose-400">{errorMessage}</p> : null}
        </section>

        {missingCourses.length > 0 ? (
          <section className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6 shadow-inner">
            <h2 className="text-lg font-semibold text-white">Courses Without Rates</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Quickly populate the form with a course detected from your entries.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {missingCourses.map((course) => (
                <button
                  key={course}
                  type="button"
                  onClick={() => {
                    setCourseInput(course);
                    setRateInput(rates[course]?.toString() ?? '');
                  }}
                  className="rounded-full border border-neutral-700 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-neutral-300 transition hover:border-neutral-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
                >
                  {course}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <section className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-6 shadow-elevated backdrop-blur">
          <h2 className="text-lg font-semibold text-white">Configured Rates</h2>
          {Object.keys(rates).length === 0 ? (
            <p className="mt-3 text-sm text-neutral-400">No custom rates defined yet.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {knownCourses.map((course) => {
                const currentRate = rates[course];
                const pendingValue = pendingRates[course] ?? (currentRate !== undefined ? currentRate.toString() : '');

                return (
                  <article
                    key={course}
                    className="flex flex-col gap-4 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4 shadow-inner md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{course}</p>
                      <p className="text-xs text-neutral-500">
                        {currentRate !== undefined
                          ? `Current rate: ${formatCurrency(currentRate)} / hr`
                          : 'No rate defined'}
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={pendingValue}
                        onChange={(event) => handlePendingRateChange(course, event.target.value)}
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950/80 px-4 py-2 text-sm text-neutral-100 shadow-inner focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500/40 disabled:cursor-not-allowed disabled:border-neutral-800 disabled:text-neutral-500 md:w-36"
                        disabled={isSaving}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveRate(course)}
                          disabled={isSaving}
                          className="rounded-full border border-neutral-700 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-neutral-300 transition hover:border-neutral-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-neutral-500/40 disabled:cursor-not-allowed disabled:border-neutral-800 disabled:text-neutral-500"
                        >
                          Update
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRate(course)}
                          disabled={isSaving}
                          className="rounded-full border border-rose-600 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-rose-300 transition hover:border-rose-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/40 disabled:cursor-not-allowed disabled:border-neutral-800 disabled:text-neutral-500"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};
