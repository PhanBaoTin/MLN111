/**
 * RoomStateService – pure in-memory store for all realtime game state.
 *
 * Lives in RAM only. MongoDB is only touched for persistence (final results).
 *
 * Structure per room:
 *  - phase: 'waiting' | 'playing' | 'paused' | 'finished'
 *  - currentQuestionIndex
 *  - timerEndsAt (ms epoch)
 *  - timerHandle (NodeJS.Timeout ref so we can clear it)
 *  - globalTimerEndsAt (ms epoch)
 *  - globalTimerHandle (NodeJS.Timeout ref)
 *  - teamBoards: Record<string, TeamBoard> – cleared tiles (0 to N)
 *  - hostToken: string  – simple shared secret for admin ops
 *  - submitCooldown: Map<playerId, lastSubmitMs>  – anti-spam
 *  - questionOrder: number[]  – shuffled question order (index into quiz.questions)
 */

import { Injectable } from '@nestjs/common';

export type GamePhase = 'waiting' | 'playing' | 'paused' | 'finished';

export interface TeamBoard {
  clearedTiles: Set<number>; // 0-8
  resets: number;
  tilesWonAt?: number; // epoch ms when all 9 cleared
}

export interface RoomState {
  roomId: string;
  quizId: string;
  phase: GamePhase;
  currentQuestionIndex: number;
  questionOrder: number[]; // indices into quiz.questions[]
  timerEndsAt: number | null; // epoch ms
  timerHandle: ReturnType<typeof setTimeout> | null;
  globalTimerEndsAt: number | null;
  globalTimerHandle: ReturnType<typeof setTimeout> | null;
  teamBoards: Record<string, TeamBoard>;
  hostToken: string;
  /** playerId -> last submit epoch ms  */
  submitCooldown: Map<string, number>;
  startedAt: number | null;
  winnerId: string | 'tie' | null;
  maxTeams: number;
}

export const TEAM_COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'cyan', 'pink'];

@Injectable()
export class RoomStateService {
  private readonly rooms = new Map<string, RoomState>();

  /** Create or re-initialise a room's in-memory state. */
  init(roomId: string, quizId: string, questionCount: number, hostToken: string, shuffle = false, maxTeams = 2): RoomState {
    // Clear any existing timer
    const existing = this.rooms.get(roomId);
    if (existing?.timerHandle) clearTimeout(existing.timerHandle);
    if (existing?.globalTimerHandle) clearTimeout(existing.globalTimerHandle);

    const order = Array.from({ length: questionCount }, (_, i) => i);
    if (shuffle) {
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
    }

    const teamBoards: Record<string, TeamBoard> = {};
    for (let i = 0; i < maxTeams && i < TEAM_COLORS.length; i++) {
      teamBoards[TEAM_COLORS[i]] = { clearedTiles: new Set(), resets: 0 };
    }

    const state: RoomState = {
      roomId,
      quizId,
      phase: 'waiting',
      currentQuestionIndex: 0,
      questionOrder: order,
      timerEndsAt: null,
      timerHandle: null,
      globalTimerEndsAt: null,
      globalTimerHandle: null,
      teamBoards,
      hostToken,
      submitCooldown: new Map(),
      startedAt: null,
      winnerId: null,
      maxTeams,
    };

    this.rooms.set(roomId, state);
    return state;
  }

  get(roomId: string): RoomState | undefined {
    return this.rooms.get(roomId);
  }

  has(roomId: string): boolean {
    return this.rooms.has(roomId);
  }

  delete(roomId: string): void {
    const state = this.rooms.get(roomId);
    if (state?.timerHandle) clearTimeout(state.timerHandle);
    if (state?.globalTimerHandle) clearTimeout(state.globalTimerHandle);
    this.rooms.delete(roomId);
  }

  /** Sets the timer handle so it can be cancelled later. */
  setTimerHandle(roomId: string, handle: ReturnType<typeof setTimeout>): void {
    const state = this.rooms.get(roomId);
    if (state) state.timerHandle = handle;
  }

  setGlobalTimerHandle(roomId: string, handle: ReturnType<typeof setTimeout>): void {
    const state = this.rooms.get(roomId);
    if (state) state.globalTimerHandle = handle;
  }

  clearTimer(roomId: string): void {
    const state = this.rooms.get(roomId);
    if (state?.timerHandle) {
      clearTimeout(state.timerHandle);
      state.timerHandle = null;
    }
  }

  clearGlobalTimer(roomId: string): void {
    const state = this.rooms.get(roomId);
    if (state?.globalTimerHandle) {
      clearTimeout(state.globalTimerHandle);
      state.globalTimerHandle = null;
    }
  }

  /** Returns a plain-object snapshot (safe for JSON emission). */
  snapshot(roomId: string): Record<string, unknown> | null {
    const s = this.rooms.get(roomId);
    if (!s) return null;
    
    const teamBoardsSnapshot: Record<string, unknown> = {};
    for (const [team, board] of Object.entries(s.teamBoards)) {
      teamBoardsSnapshot[team] = {
        clearedTiles: Array.from(board.clearedTiles),
        resets: board.resets,
        tilesWonAt: board.tilesWonAt ?? null,
      };
    }

    return {
      roomId: s.roomId,
      phase: s.phase,
      currentQuestionIndex: s.currentQuestionIndex,
      questionOrder: s.questionOrder,
      timerEndsAt: s.timerEndsAt,
      globalTimerEndsAt: s.globalTimerEndsAt,
      teamBoards: teamBoardsSnapshot,
      startedAt: s.startedAt,
      winnerId: s.winnerId,
      maxTeams: s.maxTeams,
    };
  }
}
