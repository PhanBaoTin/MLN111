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
 *  - teamBoards: { red: Set<tileIndex>, blue: Set<tileIndex> } – cleared tiles (0-8)
 *  - teamResets: { red: number, blue: number }
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
  teamBoards: Record<'red' | 'blue', TeamBoard>;
  hostToken: string;
  /** playerId -> last submit epoch ms  */
  submitCooldown: Map<string, number>;
  startedAt: number | null;
  winnerId: 'red' | 'blue' | 'tie' | null;
}

@Injectable()
export class RoomStateService {
  private readonly rooms = new Map<string, RoomState>();

  /** Create or re-initialise a room's in-memory state. */
  init(roomId: string, quizId: string, questionCount: number, hostToken: string, shuffle = false): RoomState {
    // Clear any existing timer
    const existing = this.rooms.get(roomId);
    if (existing?.timerHandle) clearTimeout(existing.timerHandle);

    const order = Array.from({ length: questionCount }, (_, i) => i);
    if (shuffle) {
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
    }

    const state: RoomState = {
      roomId,
      quizId,
      phase: 'waiting',
      currentQuestionIndex: 0,
      questionOrder: order,
      timerEndsAt: null,
      timerHandle: null,
      teamBoards: {
        red: { clearedTiles: new Set(), resets: 0 },
        blue: { clearedTiles: new Set(), resets: 0 },
      },
      hostToken,
      submitCooldown: new Map(),
      startedAt: null,
      winnerId: null,
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
    this.rooms.delete(roomId);
  }

  /** Sets the timer handle so it can be cancelled later. */
  setTimerHandle(roomId: string, handle: ReturnType<typeof setTimeout>): void {
    const state = this.rooms.get(roomId);
    if (state) state.timerHandle = handle;
  }

  clearTimer(roomId: string): void {
    const state = this.rooms.get(roomId);
    if (state?.timerHandle) {
      clearTimeout(state.timerHandle);
      state.timerHandle = null;
    }
  }

  /** Returns a plain-object snapshot (safe for JSON emission). */
  snapshot(roomId: string): Record<string, unknown> | null {
    const s = this.rooms.get(roomId);
    if (!s) return null;
    return {
      roomId: s.roomId,
      phase: s.phase,
      currentQuestionIndex: s.currentQuestionIndex,
      questionOrder: s.questionOrder,
      timerEndsAt: s.timerEndsAt,
      teamBoards: {
        red: {
          clearedTiles: Array.from(s.teamBoards.red.clearedTiles),
          resets: s.teamBoards.red.resets,
          tilesWonAt: s.teamBoards.red.tilesWonAt ?? null,
        },
        blue: {
          clearedTiles: Array.from(s.teamBoards.blue.clearedTiles),
          resets: s.teamBoards.blue.resets,
          tilesWonAt: s.teamBoards.blue.tilesWonAt ?? null,
        },
      },
      startedAt: s.startedAt,
      winnerId: s.winnerId,
    };
  }
}
