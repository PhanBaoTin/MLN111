import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCountdown } from '../../../app/hooks/use-countdown';
import { useSocket } from '../../../app/socket/socket-context';
import { TILES } from '../types';

export function GamePage() {
  const { socket, gameState, submitAnswer, requestSnapshot } = useSocket();
  const { snapshot, currentQuestion, timerEndsAt, leaderboard, winner, connected, imageBase64 } = gameState;
  const navigate = useNavigate();

  const roomId = localStorage.getItem('roomId') ?? '';
  const playerId = localStorage.getItem('playerId') ?? '';
  const myTeam = (localStorage.getItem('team') ?? 'red') as 'red' | 'blue';
  const opponentTeam: 'red' | 'blue' = myTeam === 'red' ? 'blue' : 'red';

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

  const myBoard = snapshot?.teamBoards?.[myTeam] ?? { clearedTiles: [], resets: 0 };
  const opponentBoard = snapshot?.teamBoards?.[opponentTeam] ?? { clearedTiles: [], resets: 0 };
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
          
          <h2 className="text-5xl font-display mb-8 animate-slide-up" style={{ color: winner === myTeam ? '#1b998b' : (winner === 'tie' ? '#fff' : '#ff6a3d') }}>
            {winner === 'tie' ? <><span className="inline-block animate-wiggle">🤝</span> It's a Tie!</> 
              : winner === myTeam ? <><span className="inline-block animate-float">🏆</span> Victory!</> 
              : <><span className="inline-block animate-pulse-subtle">💀</span> Defeated</>}
          </h2>

          <p className="text-[color:var(--muted)] text-lg mb-10 animate-slide-up delay-100">
            {winner === 'tie' ? 'Both teams tied on tiles!'
              : winner === myTeam ? 'Your team revealed the image first!'
              : `${opponentTeam.charAt(0).toUpperCase() + opponentTeam.slice(1)} team wins!`}
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
          <h1 className="text-3xl font-display capitalize">{myTeam} Team Board</h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Q{(snapshot?.currentQuestionIndex ?? 0) + 1}
            {currentQuestion ? ` · ${currentQuestion.timeLimit}s limit` : ''}
            {myStreak >= 3 ? <><span className="inline-block animate-wiggle">🔥</span> Streak active</> : ''}
          </p>
        </div>
        <div className="rounded-2xl border px-5 py-3 text-sm font-semibold tabular-nums transition-colors"
          style={timerUrgent ? { borderColor: '#ff6a3d', color: '#ff6a3d' } : {}}>
          {phase === 'playing' ? <><span className="inline-block animate-pulse-subtle">⏱</span> {countdown < 10 ? '0' : ''}{countdown}s</> : <><span className="inline-block animate-float">📋</span> {phase}</>}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr] flex-1 min-h-0 pb-2">
        {/* My board */}
        <div className="flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <span className="text-sm font-semibold text-[color:var(--muted)] uppercase tracking-widest">
              My Board · {myBoard.clearedTiles.length}/9 revealed
            </span>
            {myBoard.resets > 0 && <span className="text-xs text-red-400">Reset ×{myBoard.resets}</span>}
          </div>
          <div className="grid grid-cols-3 gap-2 flex-1 min-h-0">
            {TILES.map((i) => {
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
                    borderColor: isCleared ? (myTeam === 'red' ? '#ff6a3d' : '#1b998b') : undefined,
                    transform: isFlashing ? 'scale(1.08)' : 'scale(1)',
                    boxShadow: isFlashing ? `0 0 20px ${myTeam === 'red' ? '#ff6a3d66' : '#1b998b66'}` : undefined,
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
        <div className="flex flex-col gap-4 min-h-0">
          <div className="flex-1 min-h-0 flex flex-col rounded-3xl border border-white/5 bg-white/5 p-5 backdrop-blur-md shadow-2xl transition-all hover:bg-white/10 overflow-y-auto custom-scrollbar">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--muted)] font-bold flex-shrink-0">
              {phase === 'playing' ? 'Current question' : 'Waiting for host…'}
            </p>
            {currentQuestion ? (
              <>
                <div className="animate-slide-up flex flex-col flex-1 min-h-0 mt-2">
                  <p className="text-xl font-bold leading-snug text-white drop-shadow-md flex-shrink-0">{currentQuestion.text}</p>
                  <div className="mt-3 grid gap-2 text-sm overflow-y-auto pr-1 custom-scrollbar">
                    {currentQuestion.options.map((opt) => {
                      const isSelected = selectedOption === opt.id;
                      return (
                        <button key={opt.id} id={`option-${opt.id}`}
                          onClick={() => handleAnswer(opt.id)}
                          disabled={!!selectedOption || phase !== 'playing'}
                          className="group flex items-center justify-between rounded-2xl border px-4 py-3 text-left font-semibold transition-all duration-300 disabled:cursor-not-allowed hover:scale-[1.02] hover:bg-white/5"
                          style={{ 
                            borderColor: isSelected ? 'var(--accent)' : 'rgba(255,255,255,0.1)', 
                            background: isSelected ? 'rgba(255,140,105,0.15)' : 'rgba(0,0,0,0.2)',
                            boxShadow: isSelected ? '0 0 20px rgba(255,140,105,0.2)' : undefined
                          }}>
                          <span className="text-gray-200 group-hover:text-white transition-colors">{opt.text}</span>
                          {isSelected && <span className="animate-bounce-in text-[color:var(--accent)]">●</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {answerResult && (
                  <div className={`absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 rounded-3xl p-6 text-center text-white shadow-2xl backdrop-blur-md animate-bounce-in ${answerResult.isCorrect ? 'bg-teal-500/90 shadow-teal-500/50' : 'bg-rose-500/90 shadow-rose-500/50'}`}>
                    <div className="text-5xl mb-2">{answerResult.isCorrect ? '✓' : '✗'}</div>
                    <div className="text-xl font-bold uppercase tracking-widest">{answerResult.isCorrect ? 'Correct!' : 'Wrong!'}</div>
                    <div className="text-sm font-semibold opacity-90">{answerResult.isCorrect ? `+${answerResult.earnedScore} Points` : 'Board Reset'}</div>
                  </div>
                )}
              </>
            ) : (
              <p className="mt-2 text-[color:var(--muted)] text-sm">Waiting for the game to start…</p>
            )}
          </div>

          <div className="flex-shrink-0 rounded-3xl border border-white/5 bg-white/5 p-5 backdrop-blur-md shadow-2xl transition-all hover:bg-white/10">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--muted)] font-bold">My stats</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[{ label: 'Score', value: myScore, icon: '🏆', color: 'var(--accent-2)' }, { label: 'Streak', value: myStreak, icon: '🔥', color: '#ff6a3d' }, { label: 'Resets', value: myResets, icon: '🔄', color: 'var(--muted)' }].map(({ label, value, icon, color }) => (
                <div key={label} className="rounded-2xl border border-white/5 bg-black/20 p-3 shadow-inner hover:scale-105 transition-transform duration-300">
                  <div className="text-lg mb-0.5">{icon}</div>
                  <p className="text-xl font-bold font-mono" style={{ color }}>{value}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[color:var(--muted)]">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-shrink-0 rounded-3xl border border-white/5 bg-white/5 p-5 backdrop-blur-md shadow-2xl transition-all hover:bg-white/10">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--muted)] mb-2 font-bold">
              Opponent ({opponentTeam}) · {opponentBoard.clearedTiles.length}/9
            </p>
            <div className="grid grid-cols-9 gap-1">
              {TILES.map((i) => {
                const isCleared = opponentBoard.clearedTiles.includes(i);
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
            {opponentBoard.resets > 0 && (
              <p className="mt-2 text-[10px] text-[color:var(--muted)]">Reset ×{opponentBoard.resets}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
