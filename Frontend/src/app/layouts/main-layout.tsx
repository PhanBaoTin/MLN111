import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useSocket } from '../socket/socket-context';

const navItems = [
  { to: '/', label: 'Lobby', caption: 'Overview', end: true },
  { to: '/waiting', label: 'Waiting', caption: 'Players' },
  { to: '/game', label: 'Game', caption: 'Boards' },
  { to: '/admin', label: 'Admin', caption: 'Controls' },
];

export function MainLayout() {
  const { gameState } = useSocket();
  const { connected, snapshot, players, leaderboard } = gameState;
  const location = useLocation();

  const totalPlayers = (leaderboard?.length || 0) || (players?.length || 0);
  const redCount = leaderboard?.filter((p) => p.team === 'red').length || players?.filter((p) => p.team === 'red').length || 0;
  const blueCount = leaderboard?.filter((p) => p.team === 'blue').length || players?.filter((p) => p.team === 'blue').length || 0;

  const phaseLabel: Record<string, string> = {
    waiting: 'Waiting for players',
    playing: 'Game in progress',
    paused: 'Game paused',
    finished: 'Game over',
  };

  if (location.pathname !== '/admin') {
    return (
      <div className="min-h-screen text-[color:var(--ink)] p-6 md:p-10 lg:p-16">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="pill">Reveal Quiz Race</span>
            <h1 className="mt-3 text-2xl font-display">Control Hub</h1>
            <p className="mt-2 text-sm text-[color:var(--muted)]">Live match orchestration</p>
          </div>
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-semibold text-white"
            style={{ background: 'var(--accent)' }}
          >
            RQ
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`.trim()}
            >
              <span className="text-base font-display normal-case tracking-normal">{item.label}</span>
              <span className="ml-auto text-[10px] uppercase tracking-[0.24em] text-[color:var(--muted)]">
                {item.caption}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border bg-[color:var(--surface)] p-4">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: connected ? '#1b998b' : '#e55' }}
            />
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">
              {connected ? 'Connected' : 'Disconnected'}
            </p>
          </div>
          <p className="mt-2 text-lg font-semibold">
            {phaseLabel[snapshot?.phase ?? 'waiting'] ?? 'Waiting for players'}
          </p>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            {totalPlayers} player{totalPlayers !== 1 ? 's' : ''} • Red {redCount} · Blue {blueCount}
          </p>
        </div>
      </aside>

      <div className="main-area">
        {/* Redundant header removed per user request */}

        <div className="content-card">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
