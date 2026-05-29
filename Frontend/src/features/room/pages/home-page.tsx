import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../../app/socket/socket-context';

export function HomePage() {
  const { gameState, joinRoom, socket } = useSocket();
  const { connected } = gameState;
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(window.location.search);
  const [pin, setPin] = useState(() => queryParams.get('pin') ?? '');
  const [nickname, setNickname] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const TEAM_COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'cyan', 'pink', 'teal'];
  const [teamOptions, setTeamOptions] = useState<string[]>(() => TEAM_COLORS.slice(0, 8));
  const [selectedTeam, setSelectedTeam] = useState<string | null>(() => TEAM_COLORS[0]);

  const playerIdRef = useRef<string | null>(localStorage.getItem('playerId'));
  const roomIdRef = useRef<string | null>(localStorage.getItem('roomId'));

  const handleResume = () => {
    navigate('/waiting');
  };

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!pin.trim() || !nickname.trim()) return;
    if (teamOptions.length > 0 && !selectedTeam) {
      setError('Please select a team before joining.');
      return;
    }
    setJoining(true);
    setError('');
    try {
      const result = await joinRoom(pin.trim(), nickname.trim(), selectedTeam ?? undefined);
      playerIdRef.current = result.playerId;
      roomIdRef.current = result.roomId;
      localStorage.setItem('playerId', result.playerId);
      localStorage.setItem('roomId', result.roomId);
      localStorage.setItem('team', result.team);
      navigate('/waiting');
    } catch {
      setError('Could not join room – check PIN and try again.');
    } finally {
      setJoining(false);
    }
  }
useEffect(() => {
    if (!socket) return;

    // Hàm mặc định: Luôn hiển thị đầy đủ 8 màu để người chơi không bị mất nút bấm
    const resetToFullColors = () => {
      const defaultOpts = TEAM_COLORS.slice(0, 8);
      setTeamOptions(defaultOpts);
      setSelectedTeam((prev) => (prev && defaultOpts.includes(prev) ? prev : defaultOpts[0]));
    };

    // 1. Nếu ô nhập PIN trống hoặc người chơi chưa gõ xong (mã PIN thường từ 4-6 ký tự)
    if (!pin || pin.trim().length < 4) {
      resetToFullColors();
      return;
    }

    // 2. Khi đã gõ mã PIN tương đối đầy đủ -> Truy vấn server
    try {
      socket.emit('room:info', { key: pin.trim() }, (ack: any) => {
        console.log('Dữ liệu Backend trả về cho room:info:', ack);

        // Kiểm tra linh hoạt cả ack.info hoặc ack.room từ Backend
        const roomData = ack?.info || ack?.room || ack?.data;
        const maxTeams = roomData?.maxTeams;

        if (ack?.ok && maxTeams) {
          // Nếu tìm thấy phòng và có giới hạn maxTeams hợp lệ từ Admin
          const max = Math.min(maxTeams, TEAM_COLORS.length);
          const opts = TEAM_COLORS.slice(0, max);
          setTeamOptions(opts);
          setSelectedTeam((prev) => (opts.includes(prev ?? '') ? prev : opts[0]));
        } else {
          // Nếu Server bảo không tìm thấy phòng (có thể gõ sai PIN) 
          // -> GIỮ NGUYÊN 8 màu cho người chơi chọn, KHÔNG ép về 2 màu nữa
          resetToFullColors();
        }
      });
    } catch (err) {
      console.error('Lỗi Socket emit:', err);
      resetToFullColors();
    }
  }, [pin, socket]);
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

            {teamOptions.length > 0 && (
              <div className="group">
                <label className="text-[10px] text-[color:var(--muted)] mb-1.5 block uppercase tracking-widest">Choose Team</label>
                <div className="flex gap-2 flex-wrap">
                  {teamOptions.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTeam(t)}
                      className={`px-3 py-2 rounded-xl border ${selectedTeam === t ? 'bg-white/10 border-white/40' : 'border-white/10'} text-sm font-semibold`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
