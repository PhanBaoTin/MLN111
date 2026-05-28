import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../../app/socket/socket-context';

export function HomePage() {
  const { gameState, joinRoom } = useSocket();
  const { connected } = gameState;
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(window.location.search);
  const [pin, setPin] = useState(() => queryParams.get('pin') ?? '');
  const [nickname, setNickname] = useState('');
  const [team, setTeam] = useState<'red' | 'blue'>('red');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  const playerIdRef = useRef<string | null>(localStorage.getItem('playerId'));
  const roomIdRef = useRef<string | null>(localStorage.getItem('roomId'));

  const handleResume = () => {
    navigate('/waiting');
  };

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!pin.trim() || !nickname.trim()) return;
    setJoining(true);
    setError('');
    try {
      const result = await joinRoom(pin.trim(), nickname.trim(), team);
      playerIdRef.current = result.playerId;
      roomIdRef.current = result.roomId;
      localStorage.setItem('playerId', result.playerId);
      localStorage.setItem('roomId', result.roomId);
      localStorage.setItem('team', team);
      navigate('/waiting');
    } catch {
      setError('Could not join room – check PIN and try again.');
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="flex h-[80vh] flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <span className="pill inline-block mb-3">Reveal Quiz Race</span>
          <h1 className="text-3xl font-display leading-tight group">
            <span className="inline-block group-hover:animate-float">🚀</span> Join the Game
          </h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Enter the PIN provided by your host to join the room.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl transition-all hover:bg-white/10">
          <form id="join-form" onSubmit={handleJoin} className="space-y-4">
            <div className="group">
              <label className="text-[10px] text-[color:var(--muted)] mb-1.5 block uppercase tracking-widest transition-colors group-hover:text-[color:var(--accent)]">Room PIN</label>
              <input id="join-pin" type="text" placeholder="e.g. A1B2C3" value={pin}
                onChange={(e) => setPin(e.target.value.toUpperCase())} maxLength={10} required
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base font-mono tracking-[0.2em] text-white outline-none focus:border-[color:var(--accent)] focus:bg-black/40 text-center transition-all" />
            </div>
            <div className="group">
              <label className="text-[10px] text-[color:var(--muted)] mb-1.5 block uppercase tracking-widest transition-colors group-hover:text-[color:var(--accent)]">Nickname</label>
              <input id="join-nickname" type="text" placeholder="Your Name" value={nickname}
                onChange={(e) => setNickname(e.target.value)} maxLength={20} required
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none focus:border-[color:var(--accent)] focus:bg-black/40 text-center transition-all" />
            </div>
            <div>
              <label className="text-[10px] text-[color:var(--muted)] mb-1.5 block uppercase tracking-widest">Select Team</label>
              <div className="flex gap-2">
                {(['red', 'blue'] as const).map((t) => (
                  <button key={t} type="button" id={`team-${t}`} onClick={() => setTeam(t)}
                    className="group/team flex-1 rounded-2xl border py-3 text-sm font-bold uppercase tracking-widest transition-all duration-300 hover:scale-[1.02]"
                    style={team === t ? {
                      background: t === 'red' ? 'rgba(255, 106, 61, 0.15)' : 'rgba(27, 153, 139, 0.15)',
                      borderColor: t === 'red' ? '#ff6a3d' : '#1b998b',
                      color: t === 'red' ? '#ff6a3d' : '#1b998b',
                      boxShadow: `0 0 15px ${t === 'red' ? 'rgba(255, 106, 61, 0.2)' : 'rgba(27, 153, 139, 0.2)'}`
                    } : { borderColor: 'rgba(255,255,255,0.1)', color: 'var(--muted)' }}>
                    {t === 'red' ? <span className="inline-block group-hover/team:animate-wiggle">🔴</span> : <span className="inline-block group-hover/team:animate-wiggle">🔵</span>} {t}
                  </button>
                ))}
              </div>
            </div>
            <button id="join-submit" type="submit" disabled={joining || !connected}
              className="group mt-4 w-full rounded-2xl px-4 py-3 text-base font-bold text-white shadow-[0_0_20px_rgba(255,140,105,0.3)] transition-all disabled:opacity-50 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,140,105,0.5)] active:scale-95"
              style={{ background: 'linear-gradient(135deg, var(--accent), #ff6a3d)' }}>
              {joining ? 'Joining…' : connected ? <><span className="inline-block group-hover:animate-float">⚡</span> Join Game</> : 'Connecting…'}
            </button>
            {playerIdRef.current && roomIdRef.current && (
              <button type="button" onClick={handleResume}
                className="mt-2 w-full rounded-xl border border-transparent px-4 py-2 text-xs font-semibold transition hover:bg-white/5 text-[color:var(--muted)] hover:text-white">
                Resume Previous Game
              </button>
            )}
          </form>
        </div>
      </div>

      {error && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="content-card max-w-sm w-full text-center space-y-4 shadow-2xl scale-100 animate-[pulse-subtle_0.3s_ease-out]">
            <div className="text-5xl mb-2"><span className="inline-block animate-wiggle">⚠️</span></div>
            <h3 className="text-2xl font-display" style={{ color: 'var(--accent)' }}>Oops!</h3>
            <p className="text-[color:var(--muted)]">{error}</p>
            <button onClick={() => setError('')} className="mt-4 rounded-xl px-8 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow)] transition hover:scale-105" style={{ background: 'var(--accent)' }}>
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
