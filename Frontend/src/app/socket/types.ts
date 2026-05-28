/**
 * Shared types for the socket event payloads used across the frontend.
 * Keep in sync with the backend DTOs.
 */

export interface PlayerInfo {
  id: string;
  nickname: string;
  team: 'red' | 'blue' | null;
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
  clearedTiles: number[];   // 0-8
  resets: number;
  tilesWonAt: number | null;
}

export interface RoomSnapshot {
  roomId: string;
  phase: 'waiting' | 'playing' | 'paused' | 'finished';
  currentQuestionIndex: number;
  questionOrder: number[];
  timerEndsAt: number | null;
  teamBoards: {
    red: TeamBoardState;
    blue: TeamBoardState;
  };
  startedAt: number | null;
  winnerId: 'red' | 'blue' | 'tie' | null;
}
