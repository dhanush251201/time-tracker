# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Time tracking web app for logging work sessions at PENN. Users enter time entries with course names, timestamps, and markdown descriptions. The app calculates weekly stats and earnings projections based on configurable per-course hourly rates (default $18/hr, 20hr/week target).

## Commands

### Development (both services needed)
```bash
./start-all.sh     # Start frontend + backend via PM2
./stop-all.sh      # Stop all PM2 processes
./restart-all.sh   # Restart all PM2 processes
pm2 logs            # View live logs from both services
```

### Frontend only
```bash
npm run dev         # Vite dev server on port 6969 (host: time.local)
npm run build       # TypeScript compile + Vite production build
npm run preview     # Preview production build
```

### Backend only
```bash
cd backend && node server.js   # Express server on port 4000
```

### No test or lint commands are configured.

## Architecture

**Two-process architecture** managed by PM2 (see `ecosystem.config.cjs`):
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS (port 6969)
- **Backend**: Express.js REST API (port 4000), persists to JSON files in `backend/data/`

### Frontend → Backend communication
`src/lib/api.ts` provides generic HTTP helpers (GET/POST/PUT/DELETE). `src/lib/storage.ts` and `src/lib/courseRates.ts` use those helpers to call the backend. The API base URL defaults to `http://localhost:4000` and can be overridden via `VITE_API_BASE_URL`.

### Routing (React Router v6)
| Route | Page | Purpose |
|-------|------|---------|
| `/` | EntryPage | Log new time entries |
| `/log` | LogPage | View/edit/delete entries |
| `/stats` | StatsPage | Weekly breakdown + earnings |
| `/manage` | ManagementPage | Configure hourly rates per course |

### State management
Two React contexts wrap the app in `main.tsx`:
- **CourseRatesContext** — loads/saves per-course hourly rates from backend
- **EarningsVisibilityContext** — toggles earnings display in the UI

### Backend API endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/entries` | List or create time entries |
| PUT/DELETE | `/api/entries/:id` | Update or delete an entry |
| GET/PUT | `/api/course-rates` | Get all rates or upsert a rate |
| DELETE | `/api/course-rates/:courseName` | Delete a rate |

Data is stored in `backend/data/timesheet.json` and `backend/data/courseRates.json`. The backend auto-creates these files on startup if missing.

### Data model
A `TimeEntry` has: `id`, `date` (YYYY-MM-DD), `timeIn`/`timeOut` (HH:MM), `courseName`, `workMarkdown`, `createdAt` (ISO timestamp). Course rates are a simple `Record<string, number>` mapping course names to hourly rates.

## Styling

Monochrome-only design (black/white/grays). Tailwind is extended in `tailwind.config.js` with custom colors (`surface-dark`, `surface-light`) and a `shadow-elevated` utility. Markdown content renders via `react-markdown` + `remark-gfm` with custom component styling in `MarkdownPreview.tsx`.
