import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MarkdownEditor } from '../components/MarkdownEditor';
import { MarkdownPreview } from '../components/MarkdownPreview';
import { getEntries, removeEntry, updateEntry } from '../lib/storage';
import { calculateDuration, formatDate, formatDuration, formatTimeRange, formatWeekRange, getWeekBounds, sortEntriesNewestFirst } from '../lib/utils';
import type { TimeEntry } from '../types';

interface EditDraft {
  courseName: string;
  date: string;
  timeIn: string;
  timeOut: string;
  workMarkdown: string;
}

interface LogCardProps {
  entry: TimeEntry;
  onDelete: (id: string) => void;
  onStartEdit: (id: string) => void;
  onCancelEdit: () => void;
  onChange: (field: keyof EditDraft, value: string) => void;
  onSave: () => void;
  isEditing: boolean;
  draft: EditDraft | null;
}

const LogCard = ({
  entry,
  onDelete,
  onStartEdit,
  onCancelEdit,
  onChange,
  onSave,
  isEditing,
  draft,
}: LogCardProps): JSX.Element => {
  const baseDuration = useMemo(
    () => calculateDuration(entry.timeIn, entry.timeOut),
    [entry.timeIn, entry.timeOut],
  );
  const draftDuration = useMemo(() => {
    if (!isEditing || !draft) {
      return baseDuration;
    }
    return calculateDuration(draft.timeIn, draft.timeOut);
  }, [baseDuration, draft, isEditing]);
  const durationLabel = useMemo(() => formatDuration(draftDuration), [draftDuration]);
  const courseLabel = useMemo(() => {
    const raw = (isEditing && draft ? draft.courseName : entry.courseName) ?? '';
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : 'Untitled Course';
  }, [draft, entry.courseName, isEditing]);
  const currentMarkdown = (isEditing && draft ? draft.workMarkdown : entry.workMarkdown) ?? '';
  const hasMarkdown = currentMarkdown.trim().length > 0;
  const createdAtDate = useMemo(() => new Date(entry.createdAt), [entry.createdAt]);
  const createdAtValid = !Number.isNaN(createdAtDate.getTime());
  const createdAtLabel = createdAtValid
    ? createdAtDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  const handleDeleteClick = useCallback(() => onDelete(entry.id), [entry.id, onDelete]);
  const handleEditClick = useCallback(() => onStartEdit(entry.id), [entry.id, onStartEdit]);
  const handleCancelClick = useCallback(() => onCancelEdit(), [onCancelEdit]);
  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onSave();
    },
    [onSave],
  );

  const handleInputChange = useCallback(
    (field: keyof EditDraft) => (event: ChangeEvent<HTMLInputElement>) => {
      onChange(field, event.target.value);
    },
    [onChange],
  );

  const handleMarkdownChange = useCallback(
    (value: string) => {
      onChange('workMarkdown', value);
    },
    [onChange],
  );

  return (
    <article className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-6 shadow-elevated backdrop-blur">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xl font-semibold text-white">{courseLabel}</p>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            {formatDate(entry.date)}
          </p>
          <div className="mt-1 flex items-center gap-3 text-sm text-neutral-300">
            <span>
              {isEditing && draft ? formatTimeRange(draft.timeIn, draft.timeOut) : formatTimeRange(entry.timeIn, entry.timeOut)}
            </span>
            <span aria-hidden="true" className="text-neutral-700">
              •
            </span>
            <span className="font-medium text-white" aria-label="Duration">
              {durationLabel}
            </span>
          </div>
        </div>
        {createdAtValid ? (
          <time dateTime={entry.createdAt} className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            Saved {createdAtLabel}
          </time>
        ) : (
          <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Saved</span>
        )}
      </header>

      {isEditing && draft ? (
        <form id={`edit-entry-${entry.id}`} className="space-y-6" onSubmit={handleSubmit}>
          <section className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Session Details</p>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2 md:col-span-2">
                <label
                  className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400"
                  htmlFor={`courseName-${entry.id}`}
                >
                  Course Name
                </label>
                <input
                  id={`courseName-${entry.id}`}
                  type="text"
                  required
                  value={draft.courseName}
                  onChange={handleInputChange('courseName')}
                  placeholder="e.g. CIS 550 - Database Systems"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950/80 px-4 py-3 text-sm text-neutral-100 shadow-inner placeholder:text-neutral-600 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400"
                  htmlFor={`date-${entry.id}`}
                >
                  Date
                </label>
                <input
                  id={`date-${entry.id}`}
                  type="date"
                  required
                  value={draft.date}
                  onChange={handleInputChange('date')}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950/80 px-4 py-3 text-sm text-neutral-100 shadow-inner focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400"
                  htmlFor={`timeIn-${entry.id}`}
                >
                  Time In
                </label>
                <input
                  id={`timeIn-${entry.id}`}
                  type="time"
                  required
                  value={draft.timeIn}
                  onChange={handleInputChange('timeIn')}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950/80 px-4 py-3 text-sm text-neutral-100 shadow-inner focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400"
                  htmlFor={`timeOut-${entry.id}`}
                >
                  Time Out
                </label>
                <input
                  id={`timeOut-${entry.id}`}
                  type="time"
                  required
                  value={draft.timeOut}
                  onChange={handleInputChange('timeOut')}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950/80 px-4 py-3 text-sm text-neutral-100 shadow-inner focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
                />
                <p className="text-xs text-neutral-500">
                  Duration:{' '}
                  <span className="font-medium text-neutral-300">
                    {draft.timeIn && draft.timeOut ? durationLabel : '—'}
                  </span>
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Work Summary</p>
            <MarkdownEditor
              id={`workMarkdown-${entry.id}`}
              label="Work Done"
              value={draft.workMarkdown}
              onChange={handleMarkdownChange}
              helperText="Supports Markdown (**, code, lists, etc.)"
              required
            />
          </section>

          <footer className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelClick}
                className="rounded-full border border-neutral-700 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-neutral-300 transition hover:border-neutral-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full border border-neutral-100 bg-neutral-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-black transition hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
              >
                Save
              </button>
            </div>
            <button
              type="button"
              onClick={handleDeleteClick}
              className="rounded-full border border-neutral-700 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-neutral-300 transition hover:border-rose-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/40"
              aria-label="Delete entry"
            >
              Delete
            </button>
          </footer>
        </form>
      ) : (
        <>
          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Work Summary</p>
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5 shadow-inner">
              {hasMarkdown ? (
                <MarkdownPreview markdown={entry.workMarkdown} />
              ) : (
                <p className="text-sm italic text-neutral-500">(no work description)</p>
              )}
            </div>
          </section>

          <footer className="mt-6 flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleEditClick}
              className="rounded-full border border-neutral-700 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-neutral-300 transition hover:border-neutral-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDeleteClick}
              className="rounded-full border border-neutral-700 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-neutral-300 transition hover:border-rose-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/40"
              aria-label="Delete entry"
            >
              Delete
            </button>
          </footer>
        </>
      )}
    </article>
  );
};

interface WeekSectionProps {
  group: { weekStart: string; weekEnd: string; entries: TimeEntry[] };
  defaultOpen: boolean;
  entries: TimeEntry[];
  editingEntryId: string | null;
  editDraft: EditDraft | null;
  onDelete: (id: string) => void;
  onStartEdit: (id: string) => void;
  onCancelEdit: () => void;
  onChange: (field: keyof EditDraft, value: string) => void;
  onSave: () => void;
}

const WeekSection = ({
  group,
  defaultOpen,
  entries,
  editingEntryId,
  editDraft,
  onDelete,
  onStartEdit,
  onCancelEdit,
  onChange,
  onSave,
}: WeekSectionProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [entries, editingEntryId]);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <section>
      <button
        type="button"
        onClick={toggle}
        className="mb-4 flex w-full items-center gap-3 text-left focus:outline-none focus:ring-2 focus:ring-neutral-500/40 rounded-lg px-1 py-1"
      >
        <svg
          className={`h-4 w-4 shrink-0 text-neutral-500 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        </svg>
        <h2 className="text-lg font-semibold tracking-wide text-neutral-300">
          {group.weekStart && group.weekEnd
            ? formatWeekRange(group.weekStart, group.weekEnd)
            : 'Unknown Week'}
        </h2>
        <span className="text-sm text-neutral-600">
          {group.entries.length} {group.entries.length === 1 ? 'entry' : 'entries'}
        </span>
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? (contentHeight ?? 'none') : 0 }}
      >
        <div className="space-y-5">
          {entries.map((entry) => (
            <LogCard
              key={entry.id}
              entry={entry}
              onDelete={onDelete}
              onStartEdit={onStartEdit}
              onCancelEdit={onCancelEdit}
              onChange={onChange}
              onSave={onSave}
              isEditing={editingEntryId === entry.id}
              draft={editingEntryId === entry.id ? editDraft : null}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export const LogPage = (): JSX.Element => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadEntries = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const stored = await getEntries();
        setEntries(sortEntriesNewestFirst(stored));
      } catch (error) {
        console.error('[LogPage] Failed to load entries', error);
        setErrorMessage('Failed to load entries.');
      } finally {
        setIsLoading(false);
      }
    };

    loadEntries();
  }, []);

  const handleDeleteEntry = useCallback(
    async (id: string) => {
      const isEditingTarget = editingEntryId === id;
      try {
        setIsMutating(true);
        setErrorMessage(null);
        await removeEntry(id);
        setEntries((prev) => prev.filter((entry) => entry.id !== id));
        if (isEditingTarget) {
          setEditingEntryId(null);
          setEditDraft(null);
        }
      } catch (error) {
        console.error('[LogPage] Failed to delete entry', error);
        setErrorMessage('Failed to delete entry.');
      } finally {
        setIsMutating(false);
      }
    },
    [editingEntryId],
  );

  const handleStartEdit = useCallback(
    (id: string) => {
      const target = entries.find((entry) => entry.id === id);
      if (!target) {
        return;
      }

      setEditingEntryId(id);
      setEditDraft({
        courseName: target.courseName ?? '',
        date: target.date,
        timeIn: target.timeIn,
        timeOut: target.timeOut,
        workMarkdown: target.workMarkdown,
      });
    },
    [entries],
  );

  const handleCancelEdit = useCallback(() => {
    setEditingEntryId(null);
    setEditDraft(null);
  }, []);

  const handleDraftChange = useCallback((field: keyof EditDraft, value: string) => {
    setEditDraft((prev) => {
      if (!prev) {
        return prev;
      }
      return { ...prev, [field]: value };
    });
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingEntryId || !editDraft) {
      return;
    }

    const existing = entries.find((entry) => entry.id === editingEntryId);
    if (!existing) {
      return;
    }

    const updatedEntry: TimeEntry = {
      ...existing,
      courseName: editDraft.courseName.trim(),
      date: editDraft.date,
      timeIn: editDraft.timeIn,
      timeOut: editDraft.timeOut,
      workMarkdown: editDraft.workMarkdown,
    };

    try {
      setIsMutating(true);
      setErrorMessage(null);
      const saved = await updateEntry(updatedEntry);

      setEntries((prev) => {
        const next = prev.map((entry) => (entry.id === saved.id ? saved : entry));
        return sortEntriesNewestFirst(next);
      });

      setEditingEntryId(null);
      setEditDraft(null);
    } catch (error) {
      console.error('[LogPage] Failed to update entry', error);
      setErrorMessage('Failed to update entry.');
    } finally {
      setIsMutating(false);
    }
  }, [editDraft, editingEntryId, entries]);


  const weekGroups = useMemo(() => {
    const groups: { weekStart: string; weekEnd: string; entries: TimeEntry[] }[] = [];
    const weekMap = new Map<string, { weekStart: string; weekEnd: string; entries: TimeEntry[] }>();

    for (const entry of entries) {
      const bounds = getWeekBounds(entry.date);
      const key = bounds?.weekStart ?? 'unknown';
      const existing = weekMap.get(key);
      if (existing) {
        existing.entries.push(entry);
      } else {
        const group = {
          weekStart: bounds?.weekStart ?? '',
          weekEnd: bounds?.weekEnd ?? '',
          entries: [entry],
        };
        weekMap.set(key, group);
        groups.push(group);
      }
    }

    return groups;
  }, [entries]);

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">Session Log</h1>
          <p className="text-sm text-neutral-400">
            Review your tracked time entries in reverse chronological order.
          </p>
        </header>

        {entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/60 p-8 text-center text-sm text-neutral-500 shadow-inner">
            No entries yet. Create one from the New Entry page.
          </div>
        ) : (
          <div className="space-y-10">
            {weekGroups.map((group, index) => (
              <WeekSection
                key={group.weekStart || 'unknown'}
                group={group}
                defaultOpen={index === 0}
                entries={group.entries}
                editingEntryId={editingEntryId}
                editDraft={editDraft}
                onDelete={handleDeleteEntry}
                onStartEdit={handleStartEdit}
                onCancelEdit={handleCancelEdit}
                onChange={handleDraftChange}
                onSave={handleSaveEdit}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};
