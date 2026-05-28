import { RealtimeService } from './realtime.service';
export declare class RealtimeController {
    private readonly realtimeService;
    constructor(realtimeService: RealtimeService);
    getRoomState(roomKey: string): Promise<{
        room: {
            id: any;
            pin: string;
            status: import("../room/room.schema").RoomStatus;
            currentQuestionIndex: number;
            startedAt: Date | null;
            endedAt: Date | null;
            settings: import("../room/room.schema").RoomSettings;
        };
        stats: {
            totalPlayers: number;
            connectedPlayers: number;
            teamStats: Record<string, {
                total: number;
                connected: number;
            }>;
        };
        leaderboard: {
            id: string;
            nickname: string;
            team: "red" | "blue" | null;
            score: number;
            resetCount: number;
            streak: number;
            connected: boolean;
        }[];
        realtimeState: Record<string, unknown> | null;
    }>;
    getLeaderboard(roomKey: string): Promise<{
        id: string;
        nickname: string;
        team: "red" | "blue" | null;
        score: number;
        resetCount: number;
        streak: number;
        connected: boolean;
    }[]>;
    getPlayers(roomKey: string, team?: 'red' | 'blue' | 'unassigned', connected?: string): Promise<{
        id: string;
        nickname: string;
        team: "red" | "blue" | null;
        score: number;
        resetCount: number;
        streak: number;
        connected: boolean;
        joinedAt: Date | null;
    }[]>;
}
