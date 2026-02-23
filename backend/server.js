import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const ENTRIES_FILE = path.join(DATA_DIR, 'timesheet.json');
const RATES_FILE = path.join(DATA_DIR, 'courseRates.json');

const ensureDataFiles = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });

  for (const [file, defaultValue] of [
    [ENTRIES_FILE, []],
    [RATES_FILE, {}],
  ]) {
    try {
      await fs.access(file);
    } catch {
      await fs.writeFile(file, JSON.stringify(defaultValue, null, 2), 'utf8');
    }
  }
};

const readJSON = async (file, fallback) => {
  try {
    const raw = await fs.readFile(file, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`[storage] Failed to read ${file}:`, error);
    return fallback;
  }
};

const writeJSON = async (file, data) => {
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
};

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/entries', async (_req, res) => {
  const entries = await readJSON(ENTRIES_FILE, []);
  res.json(entries);
});

app.post('/api/entries', async (req, res) => {
  const entries = await readJSON(ENTRIES_FILE, []);
  const entry = req.body;

  if (!entry || typeof entry !== 'object') {
    return res.status(400).json({ message: 'Invalid entry payload.' });
  }

  entries.push(entry);
  await writeJSON(ENTRIES_FILE, entries);
  res.status(201).json(entry);
});

app.put('/api/entries/:id', async (req, res) => {
  const entries = await readJSON(ENTRIES_FILE, []);
  const index = entries.findIndex((entry) => entry.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Entry not found.' });
  }

  const updated = req.body;
  entries[index] = updated;
  await writeJSON(ENTRIES_FILE, entries);
  res.json(updated);
});

app.delete('/api/entries/:id', async (req, res) => {
  const entries = await readJSON(ENTRIES_FILE, []);
  const next = entries.filter((entry) => entry.id !== req.params.id);

  if (next.length === entries.length) {
    return res.status(404).json({ message: 'Entry not found.' });
  }

  await writeJSON(ENTRIES_FILE, next);
  res.status(204).end();
});

app.get('/api/course-rates', async (_req, res) => {
  const rates = await readJSON(RATES_FILE, {});
  res.json(rates);
});

app.put('/api/course-rates', async (req, res) => {
  const { courseName, rate } = req.body ?? {};

  if (typeof courseName !== 'string' || !courseName.trim()) {
    return res.status(400).json({ message: 'courseName is required.' });
  }

  const numericRate = Number(rate);
  if (!Number.isFinite(numericRate) || numericRate < 0) {
    return res.status(400).json({ message: 'rate must be a non-negative number.' });
  }

  const rates = await readJSON(RATES_FILE, {});
  rates[courseName.trim()] = numericRate;
  await writeJSON(RATES_FILE, rates);
  res.json(rates);
});

app.delete('/api/course-rates/:courseName', async (req, res) => {
  const rates = await readJSON(RATES_FILE, {});
  const courseName = req.params.courseName.trim();

  if (courseName in rates) {
    delete rates[courseName];
    await writeJSON(RATES_FILE, rates);
  }

  res.status(204).end();
});

app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

const PORT = process.env.PORT || 4000;

ensureDataFiles()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialise data files', error);
    process.exit(1);
  });
