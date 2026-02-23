Build a complete, production-quality time tracking web app using React + Vite + TypeScript and Tailwind CSS. The app will run fully locally in the browser, and will persist data to a JSON file-like structure using localStorage (simulate a local timesheet.json). There is NO backend/server.

Overall requirements:

Use React + TypeScript.

Use functional components with hooks.

Use modern Tailwind for styling.

Color theme: monochrome (pure black #000000, white #FFFFFF, and gray scales only).

Layout: content is centered on the page in a responsive card with rounded corners and subtle shadow.

Typography: clean, modern, Sans-serif system font stack.

All components should look sleek / dashboard-quality.

Project structure:

/src/main.tsx (React root)

/src/App.tsx (top-level layout + routing shell)

/src/components/Header.tsx (top nav / header bar)

/src/pages/EntryPage.tsx (page 1: form to enter data)

/src/pages/LogPage.tsx (page 2: view data cards)

/src/components/MarkdownEditor.tsx (textarea for markdown with label)

/src/components/MarkdownPreview.tsx (rendered markdown)

/src/lib/storage.ts (read/write localStorage “timesheet.json”)

/src/types.ts (TypeScript types)

Tailwind config already set up with dark-neutral palette only.

Routing:

Use react-router-dom with two routes:

/ → EntryPage

/log → LogPage

The header bar is persistent across pages and provides navigation links between “New Entry” and “Log”.

The active page link should be visually highlighted (e.g. lighter gray background + rounded).

Data model:

export interface TimeEntry {
  id: string;          // uuid
  date: string;        // ISO date, "YYYY-MM-DD"
  timeIn: string;      // "HH:MM"
  timeOut: string;     // "HH:MM"
  workMarkdown: string;// raw markdown user typed
  createdAt: string;   // ISO timestamp for sorting
}


Storage:

Implement storage.ts with these functions:

getEntries(): TimeEntry[]

read from localStorage["timesheet_data"]

parse JSON

if nothing stored, return []

addEntry(e: TimeEntry): void

read current list

append new entry

write back to localStorage

Treat localStorage["timesheet_data"] as the JSON file.

All logic should gracefully handle corrupted / invalid JSON by falling back to empty array.

Page 1: EntryPage (New Entry)

Centered card on a neutral dark-on-light or light-on-dark monochrome theme. (Either dark gray background #111 and light text, or white card on near-black bg; pick one consistent look site-wide.)

Card should have rounded-2xl corners, subtle shadow, border using a gray tone.

Inside the card, show a form with the following labeled inputs:

Date (type="date")

Time In (type="time")

Time Out (type="time")

Work Done (markdown textarea, multiline, tall ~8 rows)

Labels should be subtle gray, inputs should have full width, rounded-lg, thin gray border, focus ring.

Under Work Done textarea, show a small helper text in gray like “Supports Markdown (**, code, lists, etc.)”.

Include a “Save Entry” button:

Full width on mobile, auto width on desktop.

High-contrast monochrome button (e.g. white text on black background).

Rounded-xl, bold text, hover: slightly lighter gray/transition.

Form behavior:

All fields required.

When submitted:

Construct a TimeEntry object:

id: crypto.randomUUID() fallback to Date.now() string if needed.

createdAt: new Date().toISOString().

Call addEntry().

After save, clear the form and show a small success toast/inline message like: “Saved ✓” in subtle green-ish gray (do NOT add any non-monochrome colors; just use gray but with success wording).

Time validation is NOT enforced beyond required, but code should be structured so validation could be added easily later.

State management can be local useState per field.

Page 2: LogPage (Log / History)

Also use a centered container with max-width around max-w-2xl or max-w-3xl.

Fetch all entries using getEntries().

Sort entries reverse chronological by createdAt (newest first).

For each entry, render a Card:

Card styling: rounded-2xl, border border-gray-800 (or border-gray-200 depending on light/dark), soft shadow.

Top row: date + time range

Date formatted as a readable string (e.g. “Oct 28, 2025”), using toLocaleDateString.

Time In / Time Out displayed like “09:30 → 17:45”.

Use a flex layout with space-between on desktop but stacked on mobile.

Use subtle uppercase gray label text for “Date”, “Time”.

Body row: rendered markdown preview of workMarkdown

DO NOT show the raw markdown text here.

Show the rendered HTML as rich text:

Bold, italics, inline code, bullet lists, numbered lists, headings, etc.

Styling for rendered markdown should be clean and readable in monochrome:

Headings slightly larger / bolder.

Paragraph text normal gray-100 or gray-200 (light mode: gray-800).

Code spans: inline monospace with a darker gray background and rounded px-1.

Lists: use disc or decimal with proper left padding.

Long markdown should wrap and not overflow.

If there are no entries yet, render an “empty state” card in the center with:

Minimal icon substitute (simple gray circle div or emoji placeholder like ⏱ in gray).

Text: “No entries yet” and a subtext link “Add your first entry →” that routes to /.

Header bar:

Fixed at the top (sticky top-0 z-50).

Full-width horizontal bar with a dark gray or near-black background and thin bottom border in a slightly lighter gray.

Inside, centered content with max-w-4xl mx-auto px-4.

Left side: App title “Time Keeper”.

Title should be small, uppercase tracking-wide, gray-300 text.

Right side: navigation

Two links: “New Entry” (to /) and “Log” (to /log)

Each link is a button-style pill:

px-3 py-1.5 rounded-lg text-sm font-medium transition

default text-gray-400 hover:bg-gray-800 hover:text-white

For the active route: bg-gray-800 text-white border border-gray-700

On mobile, nav items should stack horizontally and wrap gracefully as needed, but still stay aligned right.

Styling / theming:

The overall page background behind the centered card should use a full-screen gradient or solid monochrome that feels premium:

e.g. bg-gradient-to-b from-black via-neutral-900 to-neutral-800

All cards float above with shadow-[0_30px_100px_rgba(0,0,0,0.6)] or similar soft shadow.

Corners should generally be rounded-2xl.

Use border border-neutral-800 (in dark mode) or equivalent.

Use text-neutral-100 for main text, text-neutral-400 for labels / meta, text-white for headings.

Spacing: generous padding (p-6, p-8).

Use flexbox / grid to keep everything centered both vertically and horizontally where appropriate. For the main page content below the header, you can use:

min-h-[calc(100vh-4rem)] flex items-center justify-center px-4

Markdown rendering:

Use a React markdown renderer library that supports GitHub-flavored markdown (like react-markdown + remark-gfm). It must:

Sanitize HTML / do not allow raw HTML injection.

Map markdown elements to styled components that match the monochrome theme.

Create a <MarkdownPreview markdown={string} /> component that:

Accepts the raw markdown string.

Renders markdown to semantic HTML.

Applies Tailwind typography styles customized for dark mode.

Example mappings:

h1,h2,h3: text-lg font-semibold text-white mb-2

p: text-neutral-200 leading-relaxed mb-3

code (inline): text-xs font-mono bg-neutral-800 text-neutral-100 px-1 py-0.5 rounded

pre code (block): full width block with bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-100 text-sm p-4 overflow-x-auto mb-4

ul,ol: text-neutral-200 pl-5 mb-3 list-disc marker:text-neutral-500

The LogPage must use this MarkdownPreview, not a plain <pre> or <textarea>.

Accessibility and UX details:

All form inputs must be associated with <label htmlFor="...">.

Inputs must have visible focus states.

Buttons must have aria-label where text might not be descriptive.

Use semantic HTML where possible (<main>, <header>, etc.).

Don’t rely only on color to indicate active nav: also change background shape (pill highlight).

Handle long markdown text by wrapping and scrolling gracefully without breaking layout.

Code quality expectations:

Use TypeScript interfaces for props.

Keep components small, reusable, and readable.

No inline anonymous functions in JSX for frequently called handlers inside lists; define them with useCallback where it makes sense (especially in list renders).

Use useEffect to load entries on LogPage mount.

Use useState to store entries after loading.

Sort entries once after load, not on every render.

Don’t mutate state arrays directly; always copy and set.

Handle error cases defensively:

If localStorage parse fails, console.warn and treat as empty.

Extra polish:

Show total hours for each entry, derived from timeIn and timeOut.

Compute duration in hours with minute precision (e.g. “7h 15m”).

Display this next to the time range in each card.

In the form, below Time Out, show a live “Duration: Xh Ym” preview as the user types times. If either timeIn or timeOut is missing, show “Duration: —”.

Add small muted section headers inside the card like “Session Details” and “Work Summary” using uppercase tight tracking, text-xs, text-neutral-500.

Edge cases:

If user sets timeOut earlier than timeIn, still save but duration calculation should clamp at 0h 0m and maybe show “0m”. Don’t block submit.

If the markdown is empty string, show “(no work description)” in gray italics on the LogPage.

Deliverables:

A working React + Vite + TypeScript project with Tailwind configured.

Fully implemented EntryPage and LogPage with routing and header.

Local persistence via localStorage acting as a JSON file.

Styled Markdown preview cards in reverse chronological order.

Now generate the full implementation:

Create all React components and pages described above.

Include all necessary imports.

Include Tailwind classes on all elements for the described visual style.

Include utility functions for:

computing human-readable duration between timeIn and timeOut

sorting entries newest-first

formatting dates

Ensure the final code you output is ready to paste into a Vite React + TS + Tailwind project and run.