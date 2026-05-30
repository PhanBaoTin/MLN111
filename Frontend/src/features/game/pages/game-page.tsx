import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCountdown } from '../../../app/hooks/use-countdown';
import { useSocket } from '../../../app/socket/socket-context';
import { type TeamBoardState } from '../../../shared/types';

export function GamePage() {
  const { socket, gameState, submitAnswer, requestSnapshot } = useSocket();
  const { snapshot, currentQuestion, timerEndsAt, leaderboard, winner, connected, imageBase64 } = gameState;
  const navigate = useNavigate();

  const roomId = localStorage.getItem('roomId') ?? '';
  const playerId = localStorage.getItem('playerId') ?? '';
  const myTeam = localStorage.getItem('team') ?? 'red';

  const colorMap: Record<string, string> = {
    red: '#ff6a3d', blue: '#1b998b', green: '#4ade80', yellow: '#facc15',
    purple: '#c084fc', orange: '#fb923c', cyan: '#22d3ee', pink: '#f472b6'
  };
  const myColor = colorMap[myTeam] || '#9ca3af';

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answerResult, setAnswerResult] = useState<{ isCorrect: boolean; earnedScore: number } | null>(null);
  const [justCleared, setJustCleared] = useState<number | null>(null);
  const questionStartRef = useRef<number>(Date.now());
  const countdown = useCountdown(timerEndsAt);

  useEffect(() => {
    if (roomId && connected) requestSnapshot(roomId, playerId || undefined);
  }, [connected, roomId, playerId, requestSnapshot]);

  useEffect(() => {
    if (snapshot && snapshot.phase === 'waiting') {
      navigate('/waiting');
    }
  }, [snapshot?.phase, navigate]);

  useEffect(() => {
    setSelectedOption(null);
    setAnswerResult(null);
    questionStartRef.current = Date.now();
  }, [currentQuestion?.id]);

  useEffect(() => {
    if (!socket) return;
    const handler = (data: { playerId: string; isCorrect: boolean; earnedScore: number }) => {
      if (data.playerId === playerId) {
        setAnswerResult({ isCorrect: data.isCorrect, earnedScore: data.earnedScore });
      }
    };
    socket.on('game:answer-result', handler);
    return () => {
      socket.off('game:answer-result', handler);
    };
  }, [socket, playerId]);

  const myBoard: TeamBoardState = snapshot?.teamBoards?.[myTeam] ?? { clearedTiles: [], resets: 0, tilesWonAt: null };
  const opponentBoards = Object.entries(snapshot?.teamBoards || {}).filter(([team]) => team !== myTeam);
  const myPlayer = leaderboard?.find((p) => p.id === playerId);
  const myScore = myPlayer?.score ?? 0;
  const myStreak = myPlayer?.streak ?? 0;
  const myResets = myPlayer?.resetCount ?? myBoard.resets;

  function handleAnswer(optionId: string) {
    if (!currentQuestion || selectedOption || !roomId || !playerId) return;
    const responseTime = Date.now() - questionStartRef.current;
    setSelectedOption(optionId);
    submitAnswer({ roomId, playerId, questionId: currentQuestion.id, selectedOptionId: optionId, responseTime });
  }

  useEffect(() => {
    if (myBoard.clearedTiles.length > 0) {
      const latest = myBoard.clearedTiles[myBoard.clearedTiles.length - 1];
      setJustCleared(latest);
      const t = setTimeout(() => setJustCleared(null), 800);
      return () => clearTimeout(t);
    }
  }, [myBoard.clearedTiles.length]);

  const phase = snapshot?.phase ?? 'waiting';
  const timerUrgent = countdown <= 5 && countdown > 0;

  return (
    <div className="flex flex-col h-[100dvh] max-w-7xl mx-auto w-full p-4 relative space-y-4 overflow-hidden">
      {/* Win Overlay Leaderboard */}
      {winner && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-start pt-12 px-6 rounded-3xl overflow-y-auto"
          style={{ background: 'rgba(22,15,31,0.95)', backdropFilter: 'blur(16px)' }}>
          
          <h2 className="text-5xl font-display mb-8 animate-slide-up" style={{ color: winner === myTeam ? myColor : (winner === 'tie' ? '#fff' : (colorMap[winner as string] || '#9ca3af')) }}>
            {winner === 'tie' ? <><span className="inline-block animate-wiggle">🤝</span> It's a Tie!</> 
              : winner === myTeam ? <><span className="inline-block animate-float">🏆</span> Victory!</> 
              : <><span className="inline-block animate-pulse-subtle">💀</span> Defeated</>}
          </h2>

          <p className="text-[color:var(--muted)] text-lg mb-10 animate-slide-up delay-100">
            {winner === 'tie' ? 'Teams tied on tiles!'
              : winner === myTeam ? 'Your team revealed the image first!'
              : `${(winner as string).charAt(0).toUpperCase() + (winner as string).slice(1)} team wins!`}
          </p>

          {/* PODIUM */}
          {leaderboard && leaderboard.length > 0 && (
            <div className="flex items-end justify-center gap-4 h-64 mb-16 animate-slide-up delay-200">
              {/* Rank 2 */}
              {leaderboard[1] && (
                <div className="flex flex-col items-center animate-slide-up delay-400">
                  <span className="text-3xl mb-2">🥈</span>
                  <span className="font-bold truncate w-24 text-center text-slate-300">{leaderboard[1].nickname}</span>
                  <span className="text-xs text-[color:var(--muted)]">{leaderboard[1].score} pts</span>
                  <div className="w-24 h-32 bg-slate-800 rounded-t-lg mt-2 relative overflow-hidden flex items-center justify-center border-t-2 border-slate-400 shadow-[0_0_15px_rgba(148,163,184,0.15)]">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
                    <span className="text-4xl font-display font-bold text-slate-500 opacity-40">2</span>
                  </div>
                </div>
              )}
              {/* Rank 1 */}
              {leaderboard[0] && (
                <div className="flex flex-col items-center z-10 animate-slide-up delay-300">
                  <span className="text-5xl mb-3 animate-bounce-in drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]" style={{ animationDelay: '600ms' }}>🥇</span>
                  <span className="font-bold text-xl text-[#ffd700] truncate w-28 text-center drop-shadow-md">{leaderboard[0].nickname}</span>
                  <span className="text-sm font-semibold text-[#ffd700]/80">{leaderboard[0].score} pts</span>
                  <div className="w-28 h-44 rounded-t-lg mt-2 relative overflow-hidden flex items-center justify-center border-t-2 border-[#ffd700] shadow-[0_0_30px_rgba(255,215,0,0.25)] animate-glow" style={{ background: 'linear-gradient(180deg, rgba(255,215,0,0.15) 0%, rgba(22,15,31,0) 100%)' }}>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                    <span className="text-6xl font-display font-bold text-[#ffd700] opacity-80 drop-shadow-md">1</span>
                  </div>
                </div>
              )}
              {/* Rank 3 */}
              {leaderboard[2] && (
                <div className="flex flex-col items-center animate-slide-up delay-500">
                  <span className="text-3xl mb-2">🥉</span>
                  <span className="font-bold truncate w-24 text-center text-amber-500/80">{leaderboard[2].nickname}</span>
                  <span className="text-xs text-[color:var(--muted)]">{leaderboard[2].score} pts</span>
                  <div className="w-24 h-24 bg-[color:var(--panel)] rounded-t-lg mt-2 relative overflow-hidden flex items-center justify-center border-t-2 border-amber-700/50 shadow-[0_0_15px_rgba(217,119,6,0.15)]">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
                    <span className="text-4xl font-display font-bold text-amber-700/40">3</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* OTHER PLAYERS LIST */}
          {leaderboard && leaderboard.length > 3 && (
            <div className="w-full max-w-md space-y-3 mb-10 animate-slide-up delay-700">
              {leaderboard.slice(3).map((p, index) => (
                <div key={p.id} className="flex items-center justify-between bg-white/5 rounded-2xl p-4 border border-white/5 shadow-sm transition-all hover:bg-white/10 hover:scale-[1.02]">
                  <div className="flex items-center gap-4">
                    <span className="text-[color:var(--muted)] font-bold w-6 text-center">{index + 4}</span>
                    <span className="font-semibold text-gray-200">{p.nickname}</span>
                  </div>
                  <span className="text-[color:var(--accent-2)] text-sm font-bold tracking-wide">{p.score} pts</span>
                </div>
              ))}
            </div>
          )}

          <button id="back-to-lobby" onClick={() => navigate('/')}
            className="mb-12 mt-auto rounded-full px-12 py-4 text-lg font-bold text-[color:var(--ink)] shadow-[var(--shadow)] animate-pop-in transition-transform hover:scale-105 active:scale-95 delay-1000"
            style={{ background: 'var(--accent)' }}>
            Back to Lobby
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-display capitalize">{myTeam} Team Board</h1>
          <p className="mt-1 text-xs text-[color:var(--muted)]">
            Q{(snapshot?.currentQuestionIndex ?? 0) + 1}
            {currentQuestion ? ` · ${currentQuestion.timeLimit}s limit` : ''}
            {myStreak >= 3 ? <><span className="inline-block animate-wiggle">🔥</span> Streak active</> : ''}
          </p>
        </div>
        <div className="rounded-xl border px-4 py-2 text-xs font-semibold tabular-nums transition-colors"
          style={timerUrgent ? { borderColor: '#ff6a3d', color: '#ff6a3d' } : {}}>
          {phase === 'playing' ? <><span className="inline-block animate-pulse-subtle">⏱</span> {countdown < 10 ? '0' : ''}{countdown}s</> : <><span className="inline-block animate-float">📋</span> {phase}</>}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.2fr,0.8fr] flex-1 min-h-0 pb-1">
        {/* My board */}
        <div className="flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-1 flex-shrink-0">
            <span className="text-xs font-semibold text-[color:var(--muted)] uppercase tracking-widest">
              My Board · {myBoard.clearedTiles.length}/{snapshot?.questionOrder?.length || 0} revealed
            </span>
            {myBoard.resets > 0 && <span className="text-[10px] text-red-400">Reset ×{myBoard.resets}</span>}
          </div>
          <div className="grid gap-1 flex-1 min-h-0" 
            style={{ 
              gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(snapshot?.questionOrder?.length || 9))}, 1fr)`,
              gridTemplateRows: `repeat(${Math.ceil((snapshot?.questionOrder?.length || 9) / Math.ceil(Math.sqrt(snapshot?.questionOrder?.length || 9)))}, 1fr)` 
            }}>
            {Array.from({ length: snapshot?.questionOrder?.length || 9 }, (_, i) => i).map((i) => {
              const isCleared = myBoard.clearedTiles.includes(i);
              const isFlashing = justCleared === i;
              return (
                <div key={i} id={`my-tile-${i}`}
                  className="board-tile flex items-center justify-center transition-all duration-500"
                  style={{
                    backgroundImage: isCleared && imageBase64 ? `url(${imageBase64})` : undefined,
                    backgroundSize: '300% 300%',
                    backgroundPosition: `${(i % 3) * 50}% ${Math.floor(i / 3) * 50}%`,
                    backgroundColor: isCleared ? 'transparent' : undefined,
                    borderColor: isCleared ? myColor : undefined,
                    transform: isFlashing ? 'scale(1.08)' : 'scale(1)',
                    boxShadow: isFlashing ? `0 0 20px ${myColor}66` : undefined,
                  }}>
                  {isCleared ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] rounded-[inherit] transition-all duration-500">
                      <span className="text-3xl inline-block animate-pulse-subtle text-white drop-shadow-md">✓</span>
                    </div>
                  ) : (
                    <span className="text-lg font-bold text-[color:var(--muted)]">{i + 1}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-2 min-h-0 overflow-y-aut ">
          <div className="flex-1 min-h-[260px] flex flex-col rounded-2xl border border-white/5 bg-white/5 p-3 backdrop-blur-md shadow-2xl transition-all hover:bg-white/10 overflow-hidden">
            <p className="text-[9px] uppercase tracking-[0.2em] text-[color:var(--muted)] font-bold flex-shrink-0">
              {phase === 'playing' ? 'Current question' : 'Waiting for host…'}
            </p>
            {currentQuestion ? (
              <>
                <div className="animate-slide-up flex flex-col flex-1 min-h-0 mt-1">
                  <p className="text-base font-bold leading-tight text-white drop-shadow-md flex-shrink-0">{currentQuestion.text}</p>
                  <div className="mt-2 grid gap-1 text-xs overflow-hidden pr-0">
                    {currentQuestion.options.map((opt) => {
                      const isSelected = selectedOption === opt.id;
                      return (
                        <button key={opt.id} id={`option-${opt.id}`}
                          onClick={() => handleAnswer(opt.id)}
                          disabled={!!selectedOption || phase !== 'playing'}
                          className="group flex items-center justify-between rounded-lg border px-3 py-2 text-left font-semibold transition-all duration-300 disabled:cursor-not-allowed hover:scale-[1.02] hover:bg-white/5"
                          style={{ 
                            borderColor: isSelected ? 'var(--accent)' : 'rgba(255,255,255,0.1)', 
                            background: isSelected ? 'rgba(255,140,105,0.15)' : 'rgba(0,0,0,0.2)',
                            boxShadow: isSelected ? '0 0 20px rgba(255,140,105,0.2)' : undefined
                          }}>
                          <span className="text-gray-200 group-hover:text-white transition-colors truncate">{opt.text}</span>
                          {isSelected && <span className="animate-bounce-in text-[color:var(--accent)] flex-shrink-0 ml-1">●</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {answerResult && (
                  <div className={`absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 rounded-2xl p-4 text-center text-white shadow-2xl backdrop-blur-md animate-bounce-in ${answerResult.isCorrect ? 'bg-teal-500/90 shadow-teal-500/50' : 'bg-rose-500/90 shadow-rose-500/50'}`}>
                    <div className="text-4xl mb-1">{answerResult.isCorrect ? '✓' : '✗'}</div>
                    <div className="text-lg font-bold uppercase tracking-widest">{answerResult.isCorrect ? 'Correct!' : 'Wrong!'}</div>
                    <div className="text-xs font-semibold opacity-90">{answerResult.isCorrect ? `+${answerResult.earnedScore} Points` : 'Board Reset'}</div>
                  </div>
                )}
              </>
            ) : (
              <p className="mt-1 text-[color:var(--muted)] text-xs">Waiting for the game to start…</p>
            )}
          </div>

          <div className="flex-shrink-0 rounded-2xl border border-white/5 bg-white/5 p-3 backdrop-blur-md shadow-2xl transition-all hover:bg-white/10">
            <p className="text-[9px] uppercase tracking-[0.2em] text-[color:var(--muted)] font-bold">My stats</p>
            <div className="mt-2 grid grid-cols-3 gap-1 text-center">
              {[{ label: 'Score', value: myScore, icon: '🏆', color: 'var(--accent-2)' }, { label: 'Streak', value: myStreak, icon: '🔥', color: '#ff6a3d' }, { label: 'Resets', value: myResets, icon: '🔄', color: 'var(--muted)' }].map(({ label, value, icon, color }) => (
                <div key={label} className="rounded-lg border border-white/5 bg-black/20 p-2 shadow-inner hover:scale-105 transition-transform duration-300">
                  <div className="text-base mb-0">{icon}</div>
                  <p className="text-lg font-bold font-mono" style={{ color }}>{value}</p>
                  <p className="text-[8px] font-bold uppercase tracking-widest text-[color:var(--muted)]">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-shrink-0 rounded-2xl border border-white/5 bg-white/5 p-3 backdrop-blur-md shadow-2xl transition-all hover:bg-white/10 flex gap-2 overflow-x-auto custom-scrollbar">
            {opponentBoards.map(([oppTeam, oppBoard]) => (
              <div key={oppTeam} className="flex-1 min-w-[100px]">
                <p className="text-[9px] uppercase tracking-[0.2em] text-[color:var(--muted)] mb-1 font-bold truncate">
                  {oppTeam} · {oppBoard.clearedTiles.length}/{snapshot?.questionOrder?.length || 0}
                </p>
                <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(snapshot?.questionOrder?.length || 9))}, 1fr)` }}>
                  {Array.from({ length: snapshot?.questionOrder?.length || 9 }, (_, i) => i).map((i) => {
                    const isCleared = oppBoard.clearedTiles.includes(i);
                    return (
                      <div key={i} className="aspect-square rounded transition-all duration-300 relative"
                        style={{ 
                          backgroundImage: isCleared && imageBase64 ? `url(${imageBase64})` : undefined,
                          backgroundSize: '300% 300%',
                          backgroundPosition: `${(i % 3) * 50}% ${Math.floor(i / 3) * 50}%`,
                          backgroundColor: isCleared ? 'transparent' : 'var(--border)' 
                        }}>
                        {isCleared && <div className="absolute inset-0 bg-black/20 rounded-[inherit]" />}
                      </div>
                    );
                  })}
                </div>
                {oppBoard.resets > 0 && (
                  <p className="mt-1 text-[8px] text-[color:var(--muted)]">Reset ×{oppBoard.resets}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}