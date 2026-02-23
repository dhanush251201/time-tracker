import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { addEntry } from '../lib/storage';
import { calculateDuration, formatDuration } from '../lib/utils';
import { MarkdownEditor } from '../components/MarkdownEditor';
import type { TimeEntry } from '../types';

const initialState = {
  courseName: '',
  date: '',
  timeIn: '',
  timeOut: '',
  workMarkdown: '',
};

const generateId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
};

export const EntryPage = (): JSX.Element => {
  const [formState, setFormState] = useState(initialState);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const duration = useMemo(
    () => calculateDuration(formState.timeIn, formState.timeOut),
    [formState.timeIn, formState.timeOut],
  );

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setSuccessMessage(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  const handleChange = useCallback(
    (field: keyof typeof initialState) => (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setFormState((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleMarkdownChange = useCallback((value: string) => {
    setFormState((prev) => ({ ...prev, workMarkdown: value }));
  }, []);

  const resetForm = () => {
    setFormState(initialState);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const newEntry: TimeEntry = {
      id: generateId(),
      courseName: formState.courseName.trim(),
      date: formState.date,
      timeIn: formState.timeIn,
      timeOut: formState.timeOut,
      workMarkdown: formState.workMarkdown,
      createdAt: new Date().toISOString(),
    };

    try {
      setIsSaving(true);
      await addEntry(newEntry);
      setSuccessMessage('Entry saved successfully.');
      resetForm();
    } catch (error) {
      console.error('[EntryPage] Failed to save entry', error);
      setErrorMessage('Failed to save entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl rounded-2xl border border-neutral-800 bg-neutral-950/70 p-8 shadow-elevated backdrop-blur">
        <div className="mb-6 space-y-2">
          <h1 className="text-2xl font-semibold text-white">Log New Time Entry</h1>
          <p className="text-sm text-neutral-400">
            Capture your session details and markdown summary. Entries stay on this device only.
          </p>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
          <section className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
              Session Details
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400"
                  htmlFor="courseName"
                >
                  Course Name
                </label>
                <input
                  id="courseName"
                  type="text"
                  required
                  value={formState.courseName}
                  onChange={handleChange('courseName')}
                  placeholder="e.g. CIS 550 - Database Systems"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950/80 px-4 py-3 text-sm text-neutral-100 shadow-inner placeholder:text-neutral-600 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500/40 disabled:cursor-not-allowed disabled:border-neutral-800 disabled:text-neutral-500"
                  disabled={isSaving}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label
                    className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400"
                    htmlFor="date"
                  >
                    Date
                  </label>
                  <input
                    id="date"
                    type="date"
                    required
                    value={formState.date}
                    onChange={handleChange('date')}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950/80 px-4 py-3 text-sm text-neutral-100 shadow-inner focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500/40 disabled:cursor-not-allowed disabled:border-neutral-800 disabled:text-neutral-500"
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400"
                    htmlFor="timeIn"
                  >
                    Time In
                  </label>
                  <input
                    id="timeIn"
                    type="time"
                    required
                    value={formState.timeIn}
                    onChange={handleChange('timeIn')}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950/80 px-4 py-3 text-sm text-neutral-100 shadow-inner focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500/40 disabled:cursor-not-allowed disabled:border-neutral-800 disabled:text-neutral-500"
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400"
                    htmlFor="timeOut"
                  >
                    Time Out
                  </label>
                  <input
                    id="timeOut"
                    type="time"
                    required
                    value={formState.timeOut}
                    onChange={handleChange('timeOut')}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950/80 px-4 py-3 text-sm text-neutral-100 shadow-inner focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500/40 disabled:cursor-not-allowed disabled:border-neutral-800 disabled:text-neutral-500"
                    disabled={isSaving}
                  />
                  <p className="text-xs text-neutral-500">
                    Duration:{' '}
                    <span className="font-medium text-neutral-300">
                      {formState.timeIn && formState.timeOut ? formatDuration(duration) : '—'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
              Work Summary
            </p>
            <MarkdownEditor
              id="workMarkdown"
              label="Work Done"
              value={formState.workMarkdown}
              onChange={handleMarkdownChange}
              helperText="Supports Markdown (**, code, lists, etc.)"
              required
              disabled={isSaving}
            />
          </section>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full rounded-2xl bg-neutral-100 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-black transition hover:bg-neutral-300 focus:outline-none focus:ring-4 focus:ring-neutral-500/40 disabled:cursor-not-allowed disabled:bg-neutral-600 disabled:text-neutral-300 md:w-auto"
            >
              {isSaving ? 'Saving…' : 'Save Entry'}
            </button>
            <div aria-live="polite" className="text-sm font-medium text-emerald-400 transition-opacity">
              {successMessage}
            </div>
            {errorMessage ? (
              <div aria-live="assertive" className="text-sm font-medium text-rose-400">
                {errorMessage}
              </div>
            ) : null}
          </div>
        </form>
      </div>
    </main>
  );
};
