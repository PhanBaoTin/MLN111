export type GamePhase = 'waiting' | 'playing' | 'paused' | 'finished';
export interface TeamBoard {
    clearedTiles: Set<number>;
    resets: number;
    tilesWonAt?: number;
}
export interface RoomState {
    roomId: string;
    quizId: string;
    phase: GamePhase;
    currentQuestionIndex: number;
    questionOrder: number[];
    timerEndsAt: number | null;
    timerHandle: ReturnType<typeof setTimeout> | null;
    teamBoards: Record<'red' | 'blue', TeamBoard>;
    hostToken: string;
    submitCooldown: Map<string, number>;
    startedAt: number | null;
    winnerId: 'red' | 'blue' | 'tie' | null;
}
export declare class RoomStateService {
    private readonly rooms;
    init(roomId: string, quizId: string, questionCount: number, hostToken: string, shuffle?: boolean): RoomState;
    get(roomId: string): RoomState | undefined;
    has(roomId: string): boolean;
    delete(roomId: string): void;
    setTimerHandle(roomId: string, handle: ReturnType<typeof setTimeout>): void;
    clearTimer(roomId: string): void;
    snapshot(roomId: string): Record<string, unknown> | null;
}
