import type { TimeEntry } from '../types';
import { apiDelete, apiGet, apiPost, apiPut } from './api';

export const getEntries = async (): Promise<TimeEntry[]> => {
  const entries = await apiGet<TimeEntry[]>('/api/entries');
  return entries.map((entry) => ({
    ...entry,
    courseName: typeof entry.courseName === 'string' ? entry.courseName : '',
  }));
};

export const addEntry = async (entry: TimeEntry): Promise<TimeEntry> => {
  const created = await apiPost<TimeEntry, TimeEntry>('/api/entries', entry);
  return {
    ...created,
    courseName: typeof created.courseName === 'string' ? created.courseName : '',
  };
};

export const removeEntry = async (id: string): Promise<void> => {
  await apiDelete(`/api/entries/${id}`);
};

export const updateEntry = async (updated: TimeEntry): Promise<TimeEntry> => {
  const saved = await apiPut<TimeEntry, TimeEntry>(`/api/entries/${updated.id}`, updated);
  return {
    ...saved,
    courseName: typeof saved.courseName === 'string' ? saved.courseName : '',
  };
};
