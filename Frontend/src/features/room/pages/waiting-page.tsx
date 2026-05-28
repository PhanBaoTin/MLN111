import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../../app/socket/socket-context';

export function WaitingPage() {
  const { gameState, requestSnapshot } = useSocket();
  const { players, leaderboard, snapshot, connected } = gameState;
  const navigate = useNavigate();

  const roomId = localStorage.getItem('roomId') ?? '';
  const playerId = localStorage.getItem('playerId') ?? '';

  useEffect(() => {
    if (roomId && connected) requestSnapshot(roomId, playerId || undefined);
  }, [connected, roomId, playerId, requestSnapshot]);

  useEffect(() => {
    if (snapshot?.phase === 'playing') navigate('/game');
  }, [snapshot?.phase, navigate]);

  const displayPlayers = leaderboard?.length ? leaderboard : (players ?? []);
  const redPlayers = displayPlayers.filter((p) => p.team === 'red');
  const bluePlayers = displayPlayers.filter((p) => p.team === 'blue');
  const unassigned = displayPlayers.filter((p) => !p.team);

  const teamColor = (team: 'red' | 'blue' | null) =>
    team === 'red' ? '#ff6a3d' : team === 'blue' ? '#1b998b' : 'var(--muted)';

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full pb-8">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md shadow-[var(--shadow)]">
        <div>
          <h1 className="text-4xl font-display group bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            <span className="inline-block group-hover:animate-float text-white">⏳</span> Waiting Room
          </h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">Scan QR or join with PIN to pick a team.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <span className="pill animate-pulse-subtle shadow-[0_0_15px_rgba(255,255,255,0.1)]">{displayPlayers.length} player{displayPlayers.length !== 1 ? 's' : ''}</span>
          <span className="pill shadow-[0_0_15px_rgba(255,255,255,0.1)]" style={{
            background: snapshot?.phase === 'waiting' ? 'rgba(255,106,61,0.2)' : 'rgba(27,153,139,0.2)',
            color: snapshot?.phase === 'waiting' ? 'var(--accent)' : 'var(--accent-2)',
            borderColor: snapshot?.phase === 'waiting' ? 'var(--accent)' : 'var(--accent-2)',
            borderWidth: '1px'
          }}>
            {snapshot?.phase ?? 'waiting'}
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-8">
        {([
          { label: 'Red Team', team: 'red' as const, members: redPlayers },
          { label: 'Blue Team', team: 'blue' as const, members: bluePlayers },
        ]).map(({ label, team, members }) => (
          <div key={team} className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md shadow-2xl transition-all hover:bg-white/10 hover:border-white/10">
            <div className="flex items-center justify-between mb-6 group">
              <h2 className="text-2xl font-display uppercase tracking-widest drop-shadow-md" style={{ color: teamColor(team) }}>
                {team === 'red' ? <span className="inline-block group-hover:animate-wiggle">🔴</span> : <span className="inline-block group-hover:animate-wiggle">🔵</span>} {label}
              </h2>
              <span className="text-sm font-bold bg-black/30 px-3 py-1 rounded-full text-white/80">{members.length} players</span>
            </div>
            {members.length === 0 ? (
              <div className="flex items-center justify-center h-32 rounded-2xl border border-dashed border-white/20 bg-black/10">
                <p className="text-sm text-[color:var(--muted)] italic">No players yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((p, i) => (
                  <div key={p.id} id={`player-${p.id}`}
                    className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 px-5 py-3 transition-all hover:bg-black/40 hover:scale-[1.02] animate-slide-up"
                    style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full flex-shrink-0 shadow-[0_0_10px_currentColor]"
                        style={{ background: p.connected !== false ? '#1b998b' : '#999', color: p.connected !== false ? '#1b998b' : '#999' }} />
                      <p className="text-base font-bold text-gray-200">{p.nickname}</p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-[color:var(--muted)]">
                      {p.score > 0 ? <span className="text-[color:var(--accent-2)]">{p.score} pts</span> : 'Ready'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {unassigned.length > 0 && (
        <div className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md shadow-2xl">
          <h2 className="text-lg font-display text-[color:var(--muted)] mb-4 uppercase tracking-widest flex justify-between">
            Picking team… <span className="bg-black/30 px-3 py-1 rounded-full">{unassigned.length}</span>
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            {unassigned.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 px-4 py-3 animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}>
                <p className="text-sm font-semibold text-gray-300">{p.nickname}</p>
                <span className="pill text-[10px] bg-white/5">No team</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
