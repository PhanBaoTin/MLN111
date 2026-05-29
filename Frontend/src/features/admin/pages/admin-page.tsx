import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../../../app/socket/socket-context';
import { type TeamBoardState } from '../../../shared/types';
import { parseDocx, getQuizzes, updateQuiz, deleteQuiz } from '../api/quiz-api';
import { quickCreateRoom, launchExistingRoom } from '../api/room-api';
import { blankQuestion, type QuestionDraft, type Tab, uid } from '../types';
import { QRCodeSVG } from 'qrcode.react';

const TILES = Array.from({ length: 9 }, (_, i) => i);

export function AdminPage() {
  const { gameState, adminControl, requestSnapshot } = useSocket();
  const { snapshot, leaderboard, pin: roomPin } = gameState;
  const [tab, setTab] = useState<Tab>('create');

  const [roomId, setRoomId] = useState(() => sessionStorage.getItem('roomId') ?? '');
  const [hostToken, setHostToken] = useState(() => sessionStorage.getItem('hostToken') ?? '');

  // Create-game form
  const [title, setTitle] = useState('');
  const [pin, setPin] = useState(() => Math.random().toString(36).slice(2, 8).toUpperCase());
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionDraft[]>([blankQuestion()]);
  const [libraryQuizzes, setLibraryQuizzes] = useState<any[]>([]);
  const [shuffle, setShuffle] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState('');
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docxInputRef = useRef<HTMLInputElement>(null);

  // Live-room controls
  const [controlMsg, setControlMsg] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [copyLinkText, setCopyLinkText] = useState('Copy Link');

  // Simple Admin Login - bypassed per request
  // isAdminAuth state removed to clear warning

  useEffect(() => {
    if (tab === 'live' && roomId && gameState.connected) requestSnapshot(roomId);
    if (tab === 'library') {
      getQuizzes().then(setLibraryQuizzes).catch(console.error);
    }
  }, [tab, roomId, gameState.connected, requestSnapshot]);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(reader.result as string);
    reader.readAsDataURL(f);
  }

  async function handleDocxImport(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setCreateMsg('Importing…');
    try {
      const data = await parseDocx(f);
      setQuestions(data.questions.map((q) => ({ ...q, id: uid() })));
      setCreateMsg(`✓ Imported ${data.questions.length} questions`);
    } catch {
      setCreateMsg('✗ Import failed');
    }
  }

  function addQuestion() { setQuestions((qs) => [...qs, blankQuestion()]); }
  function removeQuestion(idx: number) { setQuestions((qs) => qs.filter((_, i) => i !== idx)); }
  function updateQuestion(idx: number, patch: Partial<QuestionDraft>) {
    setQuestions((qs) => qs.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  }
  function updateOption(qIdx: number, oIdx: number, text: string) {
    setQuestions((qs) => qs.map((q, i) =>
      i === qIdx ? { ...q, options: q.options.map((o, j) => (j === oIdx ? { ...o, text } : o)) } : q));
  }
  function setCorrectOption(qIdx: number, oIdx: number) {
    setQuestions((qs) => qs.map((q, i) =>
      i === qIdx ? { ...q, options: q.options.map((o, j) => ({ ...o, isCorrect: j === oIdx })) } : q));
  }

  async function handleCreateGame(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || questions.length === 0) return;
    setCreating(true);
    setCreateMsg('');
    try {
      const formattedQs = questions.map((q, i) => ({ ...q, type: 'single_choice' as const, order: i }));

      if (editingQuizId) {
        await updateQuiz(editingQuizId, {
          title,
          questions: formattedQs
        });
        setCreateMsg('✓ Quiz updated successfully!');
        setEditingQuizId(null);
        setTitle('');
        setQuestions([blankQuestion()]);
        setTab('library');
      } else {
        const data = await quickCreateRoom({
          title, pin, visibility: 'private',
          imageBase64: imageDataUrl ?? undefined,
          questions: formattedQs,
          shuffleQuestions: shuffle,
        });
        const newRoomId = data.room._id;
        const newToken = data.hostToken;
        setRoomId(newRoomId);
        setHostToken(newToken);
        sessionStorage.setItem('roomId', newRoomId);
        sessionStorage.setItem('hostToken', newToken);
        sessionStorage.setItem('isAdmin', 'true');
        setCreateMsg(`✓ Game created! PIN: ${pin}`);
        setTab('live');
      }
    } catch (err: any) {
      setCreateMsg(`✗ Failed: ${err.message}`);
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteQuiz(id: string) {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await deleteQuiz(id);
      setLibraryQuizzes((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete quiz');
    }
  }

  function handleEditQuiz(quiz: any) {
    setTitle(quiz.title || '');
    setQuestions(quiz.questions || [blankQuestion()]);
    setEditingQuizId(quiz._id);
    setTab('create');
  }

  function cancelEdit() {
    setEditingQuizId(null);
    setTitle('');
    setQuestions([blankQuestion()]);
  }

  function saveConfig() {
    sessionStorage.setItem('roomId', roomId);
    sessionStorage.setItem('hostToken', hostToken);
    sessionStorage.setItem('isAdmin', 'true');
    setControlMsg('Config saved ✓');
    setTimeout(() => setControlMsg(''), 2000);
  }

  async function handleLaunchExisting(quizId: string) {
    try {
      setCreating(true);
      setCreateMsg('Launching room...');
      const newPin = Math.random().toString(36).slice(2, 8).toUpperCase();
      const res = await launchExistingRoom({
        quizId,
        pin: newPin,
        shuffleQuestions: shuffle,
      });

      setRoomId(res.room._id);
      setHostToken(res.hostToken);
      sessionStorage.setItem('roomId', res.room._id);
      sessionStorage.setItem('hostToken', res.hostToken);
      sessionStorage.setItem('isAdmin', 'true');
      setCreateMsg(`✓ Game launched! PIN: ${newPin}`);
      setTab('live');
    } catch (err: any) {
      console.error(err);
      setCreateMsg(`✗ Error: ${err.message}`);
    } finally {
      setCreating(false);
    }
  }

  function handleAdminAction(action: 'start' | 'pause' | 'reset' | 'end') {
    if (!roomId || !hostToken) { setControlMsg('Set Room ID and Host Token first.'); return; }
    setActionLoading(action);
    adminControl(roomId, action, hostToken);
    setTimeout(() => setActionLoading(null), 1200);
  }

  const redBoard: TeamBoardState = snapshot?.teamBoards?.red ?? { clearedTiles: [], resets: 0, tilesWonAt: null };
  const blueBoard: TeamBoardState = snapshot?.teamBoards?.blue ?? { clearedTiles: [], resets: 0, tilesWonAt: null };

  return (
    <div className="space-y-8 pb-10 max-w-6xl mx-auto w-full">
      {/* Tab bar */}
      <div className="flex gap-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-1.5 w-fit shadow-xl">
        {([['create', <><span className="inline-block group-hover:animate-wiggle">✏️</span> Create Game</>], ['library', <><span className="inline-block group-hover:animate-float">📚</span> My Quizzes</>], ['live', <><span className="inline-block group-hover:animate-pulse-subtle">📡</span> Live Room</>]] as [Tab, React.ReactNode][]).map(([t, label]) => (
          <button key={t} id={`tab-${t}`} onClick={() => setTab(t)}
            className="group rounded-xl px-6 py-2.5 text-sm font-bold tracking-wide transition-all duration-300"
            style={tab === t ? { background: 'var(--accent)', color: '#fff', boxShadow: '0 0 15px rgba(255, 140, 105, 0.4)' } : { color: 'var(--muted)' }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── CREATE TAB ── */}
      {tab === 'create' && (
        <form id="create-game-form" onSubmit={handleCreateGame} className="space-y-8 mt-6">
          {editingQuizId && (
            <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-3 text-sm text-yellow-600 font-semibold">
              ✏️ You are currently editing an existing game. Saving will update the questions without launching a new room.
            </div>
          )}
          <div className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md shadow-2xl space-y-4 transition-all hover:bg-white/10">
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)] font-bold">Game info</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs text-[color:var(--muted)] mb-2 block uppercase tracking-widest">Game title *</label>
                <input id="game-title" value={title} onChange={(e) => setTitle(e.target.value)} required
                  placeholder="e.g. City Skylines Quiz"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-sm outline-none focus:border-[color:var(--accent)] focus:bg-black/40 transition-all" />
              </div>
              <div>
                <label className="text-xs text-[color:var(--muted)] mb-2 block uppercase tracking-widest">Room PIN</label>
                <input id="room-pin" value={pin} onChange={(e) => setPin(e.target.value.toUpperCase())} required maxLength={8}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-sm font-mono tracking-widest outline-none focus:border-[color:var(--accent)] focus:bg-black/40 transition-all" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={shuffle} onChange={(e) => setShuffle(e.target.checked)} className="accent-[var(--accent)]" />
              Shuffle question order
            </label>
          </div>

          <div className="stat-card space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">Reveal image (9-tile board)</p>
            <p className="text-xs text-[color:var(--muted)]">Upload the secret image revealed tile-by-tile as teams answer correctly.</p>
            <div className="flex items-center gap-4 flex-wrap">
              <button type="button" id="upload-image-btn" onClick={() => fileInputRef.current?.click()}
                className="group rounded-xl border px-4 py-2 text-sm font-semibold transition hover:border-[color:var(--accent)]">
                <span className="inline-block group-hover:animate-float">📷</span> Upload Image
              </button>
              {imageDataUrl && <button type="button" onClick={() => setImageDataUrl(null)} className="text-xs text-red-400 hover:underline">Remove</button>}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
            {imageDataUrl && (
              <div className="relative mt-2 w-fit">
                <img src={imageDataUrl} alt="Reveal" className="max-h-40 rounded-2xl border object-cover" />
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 rounded-2xl overflow-hidden">
                  {TILES.map((i) => (
                    <div key={i} className="border border-white/30 bg-[color:var(--ink)]/40 flex items-center justify-center">
                      <span className="text-white/60 text-xs font-bold">{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="stat-card space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">Questions ({questions.length})</p>
              <div className="flex gap-2 flex-wrap">
                <button type="button" id="import-docx-btn" onClick={() => docxInputRef.current?.click()}
                  className="group rounded-xl border px-3 py-1.5 text-xs font-semibold transition hover:border-[color:var(--accent)]">
                  <span className="inline-block group-hover:animate-float">📄</span> Import from Word (.docx)
                </button>
                <button type="button" id="add-question-btn" onClick={addQuestion}
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold text-white" style={{ background: 'var(--accent)' }}>
                  + Add Question
                </button>
              </div>
              <input ref={docxInputRef} type="file" accept=".docx" className="hidden" onChange={handleDocxImport} />
            </div>
            {createMsg && <p className="text-xs" style={{ color: createMsg.startsWith('✓') ? '#1b998b' : '#ff6a3d' }}>{createMsg}</p>}

            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {questions.map((q, qi) => (
                <div key={q.id} id={`question-${qi}`} className="rounded-2xl border bg-[color:var(--surface)] p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="mt-2 text-xs font-bold text-[color:var(--muted)] w-5 shrink-0">Q{qi + 1}</span>
                    <textarea id={`q-text-${qi}`} value={q.text} onChange={(e) => updateQuestion(qi, { text: e.target.value })}
                      required rows={2} placeholder="Question text…"
                      className="flex-1 rounded-xl border bg-[color:var(--panel)] px-3 py-2 text-sm resize-none outline-none focus:border-[color:var(--accent)]" />
                    <button type="button" onClick={() => removeQuestion(qi)} className="mt-1 text-xs text-red-400 hover:text-red-600 shrink-0">✕</button>
                  </div>
                  <div className="flex gap-3 items-center text-xs text-[color:var(--muted)]">
                    <label className="flex items-center gap-1 group"><span className="inline-block group-hover:animate-wiggle">⏱</span>
                      <input type="number" value={q.timeLimit} min={5} max={120}
                        onChange={(e) => updateQuestion(qi, { timeLimit: +e.target.value })}
                        className="w-14 rounded border bg-[color:var(--panel)] px-2 py-0.5 text-xs outline-none focus:border-[color:var(--accent)]" />s
                    </label>
                    <label className="flex items-center gap-1 group"><span className="inline-block group-hover:animate-pulse-subtle">🏆</span>
                      <input type="number" value={q.points} min={0}
                        onChange={(e) => updateQuestion(qi, { points: +e.target.value })}
                        className="w-16 rounded border bg-[color:var(--panel)] px-2 py-0.5 text-xs outline-none focus:border-[color:var(--accent)]" />pts
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt, oi) => (
                      <div key={opt.id} className="flex items-center gap-3">
                        <label title="Mark as correct answer" className="flex items-center gap-1.5 cursor-pointer shrink-0">
                          <input type="radio" name={`correct-${qi}`} checked={opt.isCorrect || false}
                            onChange={() => setCorrectOption(qi, oi)}
                            className="w-4 h-4 cursor-pointer" style={{ accentColor: 'var(--accent)' }} />
                          <span className="text-xs font-semibold" style={{ color: opt.isCorrect ? 'var(--accent)' : 'var(--muted)' }}>Correct</span>
                        </label>
                        <input id={`opt-text-${qi}-${oi}`} type="text" value={opt.text}
                          onChange={(e) => updateOption(qi, oi, e.target.value)} required
                          placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                          className="flex-1 rounded-lg border bg-[color:var(--panel)] px-3 py-1.5 text-sm outline-none focus:border-[color:var(--accent)]"
                          style={opt.isCorrect ? { borderColor: 'var(--accent)' } : {}} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            {editingQuizId && (
              <button type="button" onClick={cancelEdit} disabled={creating}
                className="flex-1 rounded-2xl border py-3 text-sm font-semibold transition hover:bg-[color:var(--surface)] disabled:opacity-50">
                Cancel Edit
              </button>
            )}
            <button id="create-game-submit" type="submit" disabled={creating}
              className="group flex-[2] rounded-2xl py-3 text-sm font-semibold text-white shadow-[var(--shadow)] disabled:opacity-50 transition hover:scale-[1.02]"
              style={{ background: 'var(--accent)' }}>
              {creating ? 'Saving…' : editingQuizId ? <><span className="inline-block group-hover:animate-wiggle">💾</span> Update Game</> : <><span className="inline-block group-hover:animate-float">🚀</span> Create Game & Generate PIN</>}
            </button>
          </div>
        </form>
      )}

      {/* ── LIBRARY TAB ── */}
      {tab === 'library' && (
        <div className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display">My Quizzes</h2>
            <button onClick={() => getQuizzes().then(setLibraryQuizzes)} className="text-sm text-[color:var(--accent)] hover:underline">
              ↻ Refresh
            </button>
          </div>
          {libraryQuizzes.length === 0 ? (
            <div className="stat-card text-center text-[color:var(--muted)] py-10">
              No saved quizzes yet. Go to Create Game to make one!
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {libraryQuizzes.map((quiz) => (
                <div key={quiz._id} className="stat-card flex flex-col justify-between h-full">
                  <div>
                    <h3 className="font-semibold text-lg">{quiz.title}</h3>
                    <p className="text-sm text-[color:var(--muted)] line-clamp-2 mt-1">{quiz.description || 'No description'}</p>
                    <p className="text-xs text-[color:var(--muted)] mt-3">
                      {quiz.questions?.length ?? 0} questions • Created {new Date(quiz.createdAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-5 flex gap-2 flex-wrap">
                    <button onClick={() => handleLaunchExisting(quiz._id)} disabled={creating}
                      className="flex-1 rounded-xl border border-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-[color:var(--accent)] transition hover:bg-[color:var(--accent)] hover:text-white disabled:opacity-50">
                      Launch Game
                    </button>
                    <button onClick={() => handleEditQuiz(quiz)} disabled={creating}
                      className="group rounded-xl border px-3 py-2 text-sm font-semibold transition hover:bg-[color:var(--surface)]">
                      <span className="inline-block group-hover:animate-wiggle">✏️</span> Edit
                    </button>
                    <button onClick={() => handleDeleteQuiz(quiz._id)} disabled={creating}
                      className="group rounded-xl border px-3 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-500/10 hover:border-red-500">
                      <span className="inline-block group-hover:animate-wiggle">🗑</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── LIVE TAB ── */}
      {tab === 'live' && (
        <div className="space-y-8 mt-6">
          {roomPin && (
            <div className="rounded-3xl border border-[color:var(--accent)] bg-white/5 p-8 backdrop-blur-md shadow-[0_0_30px_rgba(255,140,105,0.15)] flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-between transition-all hover:bg-white/10">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)] mb-3 font-bold">Join Game</p>
                <h2 className="text-5xl font-mono tracking-[0.2em] font-bold text-[color:var(--accent)] mb-6 drop-shadow-md">{roomPin}</h2>
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-gray-300">Invite players using the PIN or link:</p>
                  <div className="flex gap-3 flex-wrap">
                    <button onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/?pin=${roomPin}`);
                        setCopyLinkText('Copied! ✓');
                        setTimeout(() => setCopyLinkText('Copy Link'), 2000);
                      }} 
                      className="group rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-sm font-bold transition-all hover:bg-black/40 flex items-center gap-2 hover:scale-[1.02]">
                      <span className="inline-block group-hover:animate-wiggle">🔗</span> {copyLinkText}
                    </button>
                    <button onClick={() => setShowQR(!showQR)} 
                      className="group rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-sm font-bold transition-all hover:bg-black/40 flex items-center gap-2 hover:scale-[1.02]">
                      <span className="inline-block group-hover:animate-float">📱</span> {showQR ? 'Hide QR' : 'Show QR'}
                    </button>
                  </div>
                </div>
              </div>
              {showQR && (
                <div className="rounded-xl bg-white p-3 shadow-sm transition-all animate-pulse-subtle duration-300">
                  <QRCodeSVG value={`${window.location.origin}/?pin=${roomPin}`} size={120} />
                </div>
              )}
            </div>
          )}

          <div className="stat-card space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">Room config</p>
            <div className="grid gap-3 md:grid-cols-2">
              <input id="live-room-id" value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="Room ID"
                className="rounded-xl border bg-[color:var(--surface)] px-4 py-2 text-sm font-mono outline-none focus:border-[color:var(--accent)]" />
              <input id="live-host-token" value={hostToken} onChange={(e) => setHostToken(e.target.value)} placeholder="Host Token"
                className="rounded-xl border bg-[color:var(--surface)] px-4 py-2 text-sm font-mono outline-none focus:border-[color:var(--accent)]" />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button id="save-config-btn" onClick={saveConfig} className="rounded-full border px-4 py-1.5 text-sm font-semibold">Save</button>
              {controlMsg && <span className="text-xs" style={{ color: controlMsg.includes('saved') || controlMsg.startsWith('✓') ? '#1b998b' : '#ff6a3d' }}>{controlMsg}</span>}
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md shadow-2xl transition-all hover:bg-white/10">
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)] mb-4 font-bold">Game controls</p>
            <div className="flex gap-3 flex-wrap">
              {([
                { label: <><span className="inline-block group-hover:animate-pulse-subtle">▶</span> Start</>, action: 'start', bg: 'var(--accent-2)', shadow: 'rgba(46,196,182,0.3)' },
                { label: <><span className="inline-block group-hover:animate-pulse-subtle">⏸</span> Pause</>, action: 'pause', bg: '', color: 'var(--muted)' },
                { label: <><span className="inline-block group-hover:animate-spin-slow">↺</span> Reset</>, action: 'reset', color: 'var(--accent)' },
                { label: <><span className="inline-block group-hover:animate-wiggle">⏹</span> End</>, action: 'end', bg: 'var(--accent)', shadow: 'rgba(255,140,105,0.3)' },
              ] as { label: React.ReactNode; action: 'start' | 'pause' | 'reset' | 'end'; bg?: string; color?: string; shadow?: string }[]).map(({ label, action, bg, color, shadow }) => (
                <button key={action} id={`ctrl-${action}`} onClick={() => handleAdminAction(action)} disabled={!!actionLoading}
                  className="group rounded-2xl border px-6 py-3 text-sm font-bold transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
                  style={{ background: bg || undefined, color: bg ? '#fff' : color || undefined, borderColor: color || (bg ? 'transparent' : 'rgba(255,255,255,0.1)'), boxShadow: shadow ? `0 0 20px ${shadow}` : undefined }}>
                  {actionLoading === action ? '…' : label}
                </button>
              ))}
            </div>
            {snapshot && (
              <div className="mt-3 flex gap-4 text-xs text-[color:var(--muted)]">
                <span>Phase: <b className="text-[color:var(--ink)]">{snapshot.phase}</b></span>
                <span>Question: <b className="text-[color:var(--ink)]">{(snapshot.currentQuestionIndex ?? 0) + 1}/{snapshot.questionOrder?.length ?? 0}</b></span>
                {snapshot.winnerId && <span>Winner: <b style={{ color: snapshot.winnerId === 'red' ? '#ff6a3d' : '#1b998b' }}>{snapshot.winnerId.toUpperCase()}</b></span>}
              </div>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {([['Red', redBoard, '#ff6a3d'], ['Blue', blueBoard, '#1b998b']] as [string, typeof redBoard, string][]).map(([name, board, color]) => (
              <div key={name} className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md shadow-2xl transition-all hover:bg-white/10 hover:border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-2xl uppercase tracking-widest drop-shadow-md" style={{ color }}>{name} Team</h2>
                  <span className="text-sm font-bold bg-black/30 px-3 py-1 rounded-full text-white/80">{board.clearedTiles.length}/9 · Reset ×{board.resets}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {TILES.map((i) => {
                    const cleared = board.clearedTiles.includes(i);
                    return (
                      <div key={i} className="aspect-square rounded-2xl flex items-center justify-center text-lg font-bold transition-all duration-500"
                        style={{ background: cleared ? `${color}33` : 'rgba(0,0,0,0.2)', border: `1px solid ${cleared ? color : 'rgba(255,255,255,0.05)'}`, color: cleared ? color : 'var(--muted)', boxShadow: cleared ? `0 0 15px ${color}44` : undefined }}>
                        {cleared ? '✓' : i + 1}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-3xl border">
            <div className="flex items-center justify-between bg-[color:var(--surface)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">
                Live Rankings · {leaderboard.length} player{leaderboard.length !== 1 ? 's' : ''}
              </p>
              <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: '#1b998b' }} />
            </div>
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[color:var(--surface)] border-t">
                <tr>
                  {['#', 'Player', 'Team', 'Score', 'Streak', 'Resets', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(!leaderboard || leaderboard.length === 0) ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-[color:var(--muted)] italic text-sm">No players yet — share PIN to join</td></tr>
                ) : leaderboard.map((p, idx) => (
                  <tr key={p.id} id={`lb-${p.id}`} className="border-t transition-colors hover:bg-[color:var(--surface)]">
                    <td className="px-4 py-3 font-mono text-[color:var(--muted)] text-xs">
                      {idx === 0 ? <span className="inline-block animate-pulse-subtle text-lg">🥇</span> : 
                       idx === 1 ? <span className="inline-block text-lg">🥈</span> : 
                       idx === 2 ? <span className="inline-block text-lg">🥉</span> : 
                       idx + 1}
                    </td>
                    <td className="px-4 py-3 font-semibold">{p.nickname}</td>
                    <td className="px-4 py-3">
                      <span className="pill text-xs transition-transform hover:scale-110" style={p.team === 'red' ? { background: 'var(--accent-soft)', color: 'var(--accent)' } : p.team === 'blue' ? { background: 'rgba(46, 196, 182, 0.15)', color: 'var(--accent-2)' } : {}}>
                        {p.team ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold">{p.score}</td>
                    <td className="px-4 py-3">{p.streak > 0 ? `🔥 ${p.streak}` : p.streak}</td>
                    <td className="px-4 py-3 text-xs">{p.resetCount ?? 0}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs" style={{ color: p.connected !== false ? '#1b998b' : '#999' }}>
                        <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ background: p.connected !== false ? '#1b998b' : '#999' }} />
                        {p.connected !== false ? 'Online' : 'Offline'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
