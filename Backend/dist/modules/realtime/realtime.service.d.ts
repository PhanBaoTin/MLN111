import { Model, Types } from 'mongoose';
import { Player, PlayerDocument } from '../player/player.schema';
import { PlayerAnswerDocument } from '../player-answer/player-answer.schema';
import { QuizDocument } from '../quiz/quiz.schema';
import { Room, RoomDocument } from '../room/room.schema';
import { AdminControlDto } from './dto/admin-control.dto';
import { AnswerQuestionDto } from './dto/answer-question.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { LeaveRoomDto } from './dto/leave-room.dto';
import { GetSnapshotDto } from './dto/get-snapshot.dto';
import { RoomStateService } from './room-state.service';
export declare class RealtimeService {
    private readonly roomModel;
    private readonly quizModel;
    private readonly playerModel;
    private readonly playerAnswerModel;
    private readonly roomState;
    constructor(roomModel: Model<RoomDocument>, quizModel: Model<QuizDocument>, playerModel: Model<PlayerDocument>, playerAnswerModel: Model<PlayerAnswerDocument>, roomState: RoomStateService);
    private findRoomByKey;
    getRoomInfoByKey(roomKey: string): Promise<{
        pin: string;
        maxTeams: number;
    }>;
    private findRoom;
    joinRoom(payload: JoinRoomDto, socketId: string): Promise<{
        room: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Room, {}, {}> & Room & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, Room, {}, {}> & Room & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: Types.ObjectId;
        }>;
        player: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Player, {}, {}> & Player & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, Player, {}, {}> & Player & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: Types.ObjectId;
        }>;
    }>;
    markDisconnected(socketId: string): Promise<{
        player: (import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Player, {}, {}> & Player & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, Player, {}, {}> & Player & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: Types.ObjectId;
        }>) | null;
    }>;
    leaveRoom(payload: LeaveRoomDto, _socketId: string): Promise<{
        player: (import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Player, {}, {}> & Player & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, Player, {}, {}> & Player & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: Types.ObjectId;
        }>) | null;
        roomId: string;
    }>;
    getSnapshot(payload: GetSnapshotDto, socketId?: string): Promise<{
        snapshot: Record<string, unknown> | null;
        leaderboard: {
            id: string;
            nickname: string;
            team: string | null;
            score: number;
            resetCount: number;
            streak: number;
            connected: boolean;
        }[];
        connectedPlayers: number;
        pin: string;
        imageBase64: string | null;
        reconnectedPlayer: (import("mongoose").Document<unknown, {}, Player, {}, {}> & Player & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        }) | null;
    }>;
    submitAnswer(payload: AnswerQuestionDto, onTimeout: (roomId: string, winner: 'red' | 'blue' | 'tie') => void): Promise<{
        player: (import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Player, {}, {}> & Player & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, Player, {}, {}> & Player & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: Types.ObjectId;
        }>) | null;
        isCorrect: boolean;
        earnedScore: number;
        leaderboard: {
            id: string;
            nickname: string;
            team: string | null;
            score: number;
            resetCount: number;
            streak: number;
            connected: boolean;
        }[];
        shouldReset: boolean;
        clearedTileIndex: number | null;
        resetBoard: boolean;
        team: string | null;
        winEvent: {
            winner: string | "tie";
        } | null;
    }>;
    handleAdminControl(payload: AdminControlDto, onTimeout: (roomId: string, winner: 'red' | 'blue' | 'tie') => void): Promise<{
        room: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Room, {}, {}> & Room & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, Room, {}, {}> & Room & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: Types.ObjectId;
        }>;
        action: "start" | "pause" | "reset" | "end";
        snapshot: Record<string, unknown> | null;
    }>;
    private handleQuestionTimeout;
    private handleGlobalTimeout;
    private resolveWin;
    private determineWinnerByTiles;
    getLeaderboard(roomId: string): Promise<{
        id: string;
        nickname: string;
        team: string | null;
        score: number;
        resetCount: number;
        streak: number;
        connected: boolean;
    }[]>;
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
            team: string | null;
            score: number;
            resetCount: number;
            streak: number;
            connected: boolean;
        }[];
        realtimeState: Record<string, unknown> | null;
    }>;
    getLeaderboardByKey(roomKey: string): Promise<{
        id: string;
        nickname: string;
        team: string | null;
        score: number;
        resetCount: number;
        streak: number;
        connected: boolean;
    }[]>;
    getPlayersByKey(roomKey: string, filters?: {
        team?: string | 'unassigned';
        connected?: boolean;
    }): Promise<{
        id: string;
        nickname: string;
        team: string | null;
        score: number;
        resetCount: number;
        streak: number;
        connected: boolean;
        joinedAt: Date | null;
    }[]>;
    getQuestionsForRoom(roomId: string): Promise<{
        displayIndex: number;
        id: string;
        text: string;
        timeLimit: number;
        points: number;
        options: {
            id: string;
            text: string;
        }[];
    }[] | null>;
}
