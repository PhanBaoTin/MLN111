import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { io, type Socket } from 'socket.io-client';
import type { PlayerInfo, QuizQuestion, RoomSnapshot } from './types';

// ── Config ────────────────────────────────────────────────────────────────

const SERVER_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3001';
console.log('SERVER_URL =', SERVER_URL);
// ── State type ────────────────────────────────────────────────────────────

export interface GameState {
  /** Current room snapshot (board, phase, timer) */
  snapshot: RoomSnapshot | null;
  /** Quiz questions (options without isCorrect) */
  questions: QuizQuestion[] | null;
  /** Current question (derived from snapshot.currentQuestionIndex) */
  currentQuestion: QuizQuestion | null;
  /** Server-side epoch ms when current question timer ends */
  timerEndsAt: number | null;
  /** Sorted leaderboard */
  leaderboard: PlayerInfo[];
  /** Players in waiting room */
  players: PlayerInfo[];
  /** Winner id after game ends */
  winner: string | 'tie' | null;
  /** Connection status */
  connected: boolean;
  /** Room PIN (added for QR code generation) */
  pin?: string;
  /** Image Base 64 string for game board */
  imageBase64?: string | null;
}

export interface SocketContextValue {
  socket: Socket | null;
  gameState: GameState;
  /** Join a room.  Returns { roomId, playerId, team } via ack. */
  joinRoom: (pin: string, nickname: string, team?: string) => Promise<{ roomId: string; playerId: string; team: string }>;
  /** Send an answer.  Requires game to be in 'playing' phase. */
  submitAnswer: (payload: {
    roomId: string;
    playerId: string;
    questionId: string;
    selectedOptionId: string;
    responseTime: number;
  }) => void;
  /** Admin control (start/pause/reset/end). */
  adminControl: (roomId: string, action: 'start' | 'pause' | 'reset' | 'end', hostToken: string) => void;
  /** Request a full state snapshot (reconnect). */
  requestSnapshot: (roomId: string, playerId?: string) => void;
}

// ── Context ───────────────────────────────────────────────────────────────

const SocketContext = createContext<SocketContextValue | null>(null);

const DEFAULT_STATE: GameState = {
  snapshot: null,
  questions: null,
  currentQuestion: null,
  timerEndsAt: null,
  leaderboard: [],
  players: [],
  winner: null,
  connected: false,
  imageBase64: null,
};

// ── Provider ──────────────────────────────────────────────────────────────

export function SocketProvider({ children }: PropsWithChildren) {
  const socketRef = useRef<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState>(DEFAULT_STATE);

  // Helper to derive currentQuestion from snapshot + questions list
  const deriveCurrentQuestion = useCallback(
    (snap: RoomSnapshot | null, qs: QuizQuestion[] | null): QuizQuestion | null => {
      if (!snap || !qs || !qs.length) return null;
      return qs[snap.currentQuestionIndex] ?? null;
    },
    [],
  );

  useEffect(() => {
    const socket = io(SERVER_URL, { withCredentials: true, autoConnect: true });
    socketRef.current = socket;

    // ── Connection ────────────────────────────────────────────────────────
    socket.on('connect', () => {
      setGameState((s) => ({ ...s, connected: true }));
    });

    socket.on('disconnect', () => {
      setGameState((s) => ({ ...s, connected: false }));
    });

    // ── Room events ───────────────────────────────────────────────────────
    socket.on('room:player-joined', (data: { player: PlayerInfo }) => {
      setGameState((s) => {
        const exists = s.players.some((p) => p.id === data.player.id);
        const players = exists
          ? s.players.map((p) => (p.id === data.player.id ? { ...p, ...data.player } : p))
          : [...s.players, data.player];

        const existsInLeaderboard = s.leaderboard.some((p) => p.id === data.player.id);
        const leaderboard = existsInLeaderboard
          ? s.leaderboard.map((p) => (p.id === data.player.id ? { ...p, ...data.player } : p))
          : [...s.leaderboard, data.player];

        return { ...s, players, leaderboard };
      });
    });

    socket.on('room:player-left', (data: { playerId: string }) => {
      setGameState((s) => {
        const players = s.players.map((p) =>
          p.id === data.playerId ? { ...p, connected: false } : p,
        );
        const leaderboard = s.leaderboard.map((p) =>
          p.id === data.playerId ? { ...p, connected: false } : p,
        );
        return { ...s, players, leaderboard };
      });
    });

    // ── Snapshot (reconnect replay) ───────────────────────────────────────
    socket.on(
      'room:state-snapshot',
      (data: { snapshot: RoomSnapshot; leaderboard: PlayerInfo[]; questions: QuizQuestion[]; pin?: string; imageBase64?: string | null }) => {
        setGameState((s) => ({
          ...s,
          snapshot: data.snapshot,
          questions: data.questions,
          currentQuestion: deriveCurrentQuestion(data.snapshot, data.questions),
          timerEndsAt: data.snapshot?.timerEndsAt,
          leaderboard: data.leaderboard,
          players: data.leaderboard,
          winner: data.snapshot?.winnerId,
          pin: data.pin ?? s.pin,
          imageBase64: data.imageBase64 ?? s.imageBase64,
        }));
      },
    );

    // ── Leaderboard ───────────────────────────────────────────────────────
    socket.on('game:leaderboard', (data: { leaderboard: PlayerInfo[] }) => {
      setGameState((s) => ({ ...s, leaderboard: data.leaderboard }));
    });

    // ── Board update ──────────────────────────────────────────────────────
    socket.on(
      'game:board-update',
      (data: {
        team: string;
        clearedTiles: number[];
        resets: number;
        resetBoard: boolean;
      }) => {
        setGameState((s) => {
          if (!s.snapshot) return s;
          const updatedBoards = {
            ...s.snapshot.teamBoards,
            [data.team]: {
              clearedTiles: data.clearedTiles,
              resets: data.resets,
              tilesWonAt: s.snapshot.teamBoards[data.team]?.tilesWonAt ?? null,
            },
          };
          return {
            ...s,
            snapshot: { ...s.snapshot, teamBoards: updatedBoards },
          };
        });
      },
    );

    // ── Next question (after timeout) ─────────────────────────────────────
    socket.on(
      'game:next-question',
      (data: { currentIndex: number; timerEndsAt: number; currentQuestion: QuizQuestion }) => {
        setGameState((s) => ({
          ...s,
          currentQuestion: data.currentQuestion,
          timerEndsAt: data.timerEndsAt,
          snapshot: s.snapshot
            ? { ...s.snapshot, currentQuestionIndex: data.currentIndex, timerEndsAt: data.timerEndsAt }
            : s.snapshot,
        }));
      },
    );

    // ── Questions broadcast (on game start) ───────────────────────────────
    socket.on(
      'game:questions',
      (data: { questions: QuizQuestion[]; currentIndex: number; timerEndsAt: number | null }) => {
        setGameState((s) => ({
          ...s,
          questions: data.questions,
          currentQuestion: data.questions[data.currentIndex] ?? null,
          timerEndsAt: data.timerEndsAt,
        }));
      },
    );

    // ── Admin events ──────────────────────────────────────────────────────
    socket.on('admin:start', (data: { snapshot: RoomSnapshot }) => {
      setGameState((s) => ({
        ...s,
        snapshot: data.snapshot
          ? { ...s.snapshot, ...data.snapshot, phase: 'playing' } as RoomSnapshot
          : s.snapshot,
      }));
    });

    socket.on('admin:pause', (data: { snapshot: RoomSnapshot }) => {
      setGameState((s) => ({
        ...s,
        snapshot: s.snapshot ? { ...s.snapshot, phase: 'paused' } : s.snapshot,
      }));
      void data;
    });

    socket.on('admin:reset', () => {
      setGameState((s) => ({
        ...s,
        snapshot: s.snapshot
          ? {
              ...s.snapshot,
              phase: 'waiting',
              currentQuestionIndex: 0,
              teamBoards: Object.fromEntries(
                Object.keys(s.snapshot.teamBoards || {}).map(team => [
                  team, 
                  { clearedTiles: [], resets: 0, tilesWonAt: null }
                ])
              ),
              winnerId: null,
            }
          : s.snapshot,
        winner: null,
        currentQuestion: s.questions?.[0] ?? null,
        timerEndsAt: null,
      }));
    });

    socket.on('admin:end', () => {
      setGameState((s) => ({
        ...s,
        snapshot: s.snapshot ? { ...s.snapshot, phase: 'finished' } : s.snapshot,
      }));
    });

    // ── Winner ────────────────────────────────────────────────────────────
    socket.on('game:winner', (data: { winner: string | 'tie' }) => {
      setGameState((s) => ({
        ...s,
        winner: data.winner,
        snapshot: s.snapshot ? { ...s.snapshot, phase: 'finished', winnerId: data.winner } : s.snapshot,
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [deriveCurrentQuestion]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const joinRoom = useCallback(
    (pin: string, nickname: string, team?: string) => {
      return new Promise<{ roomId: string; playerId: string; team: string }>((resolve, reject) => {
        const s = socketRef.current;
        if (!s) return reject(new Error('Socket not initialised'));
        s.emit('room:join', { pin, nickname, team }, (ack: { ok: boolean; roomId: string; playerId: string; team: string }) => {
          if (ack?.ok) resolve({ roomId: ack.roomId, playerId: ack.playerId, team: ack.team });
          else reject(new Error('Join failed'));
        });
      });
    },
    [],
  );

  const submitAnswer = useCallback(
    (payload: {
      roomId: string;
      playerId: string;
      questionId: string;
      selectedOptionId: string;
      responseTime: number;
    }) => {
      socketRef.current?.emit('game:answer', payload);
    },
    [],
  );

  const adminControl = useCallback(
    (roomId: string, action: 'start' | 'pause' | 'reset' | 'end', hostToken: string) => {
      socketRef.current?.emit('admin:control', { roomId, action, hostToken });
    },
    [],
  );

  const requestSnapshot = useCallback((roomId: string, playerId?: string) => {
    socketRef.current?.emit('room:snapshot', { roomId, playerId });
  }, []);

  const value: SocketContextValue = {
    socket: socketRef.current,
    gameState,
    joinRoom,
    submitAnswer,
    adminControl,
    requestSnapshot,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}
