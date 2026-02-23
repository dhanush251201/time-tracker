export interface TimeEntry {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  timeIn: string; // HH:MM
  timeOut: string; // HH:MM
  courseName: string;
  workMarkdown: string;
  createdAt: string; // ISO timestamp
}
