/** Shared domain types used across features */

export interface PlayerInfo {
  id: string;
  nickname: string;
  team: string | null;
  score: number;
  streak: number;
  resetCount?: number;
  connected?: boolean;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  displayIndex: number;
  id: string;
  text: string;
  timeLimit: number;
  points: number;
  options: QuizOption[];
}

export interface TeamBoardState {
  clearedTiles: number[];
  resets: number;
  tilesWonAt: number | null;
}

export interface RoomSnapshot {
  roomId: string;
  phase: 'waiting' | 'playing' | 'paused' | 'finished';
  currentQuestionIndex: number;
  questionOrder: number[];
  timerEndsAt: number | null;
  globalTimerEndsAt?: number | null;
  teamBoards: Record<string, TeamBoardState>;
  startedAt: number | null;
  winnerId: string | 'tie' | null;
  maxTeams?: number;
}
