import { NavLink, useLocation } from 'react-router-dom';
import { useEarningsVisibility } from '../context/EarningsVisibilityContext';

const navLinks = [
  { to: '/', label: 'New Entry', end: true },
  { to: '/log', label: 'Log' },
  { to: '/stats', label: 'Statistics' },
  { to: '/manage', label: 'Manage' },
];

export const Header = (): JSX.Element => {
  const { showEarnings, toggleEarnings } = useEarningsVisibility();
  const location = useLocation();
  const isStatsPage = location.pathname.startsWith('/stats');

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800 bg-black/60 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold uppercase tracking-[0.4em] text-neutral-400">
            Time Tracker
          </div>
          {isStatsPage ? (
            <button
              type="button"
              onClick={toggleEarnings}
              className="rounded-full border border-neutral-800 bg-neutral-900/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-300 transition hover:border-neutral-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
              aria-pressed={showEarnings}
              aria-label={showEarnings ? 'Hide earnings' : 'Show earnings'}
            >
              {showEarnings ? 'Hide Earnings' : 'Show Earnings'}
            </button>
          ) : null}
        </div>
        <nav aria-label="Primary">
          <ul className="flex items-center gap-1 rounded-full bg-neutral-900/70 p-1">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    [
                      'block rounded-full px-4 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-neutral-100 text-black'
                        : 'text-neutral-300 hover:bg-neutral-800 hover:text-white',
                    ].join(' ')
                  }
                  end={link.end}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};
