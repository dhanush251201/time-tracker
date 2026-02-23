import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import './index.css';
import { EntryPage } from './pages/EntryPage';
import { LogPage } from './pages/LogPage';
import { StatsPage } from './pages/StatsPage';
import { ManagementPage } from './pages/ManagementPage';
import { EarningsVisibilityProvider } from './context/EarningsVisibilityContext';
import { CourseRatesProvider } from './context/CourseRatesContext';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found');
}

createRoot(container).render(
  <StrictMode>
    <CourseRatesProvider>
      <EarningsVisibilityProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<EntryPage />} />
              <Route path="log" element={<LogPage />} />
              <Route path="stats" element={<StatsPage />} />
              <Route path="manage" element={<ManagementPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </EarningsVisibilityProvider>
    </CourseRatesProvider>
  </StrictMode>,
);
