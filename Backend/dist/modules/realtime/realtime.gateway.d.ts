import { OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AdminControlDto } from './dto/admin-control.dto';
import { AnswerQuestionDto } from './dto/answer-question.dto';
import { GetSnapshotDto } from './dto/get-snapshot.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { LeaderboardDto } from './dto/leaderboard.dto';
import { LeaveRoomDto } from './dto/leave-room.dto';
import { RealtimeService } from './realtime.service';
export declare class RealtimeGateway implements OnGatewayInit {
    private readonly realtimeService;
    server: Server;
    constructor(realtimeService: RealtimeService);
    afterInit(_server: Server): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): Promise<void>;
    handleRoomJoin(client: Socket, payload: JoinRoomDto): Promise<{
        ok: boolean;
        roomId: any;
        playerId: string;
    }>;
    handleRoomLeave(client: Socket, payload: LeaveRoomDto): Promise<{
        ok: boolean;
        roomId: string;
        playerId: string;
    }>;
    handleSnapshot(client: Socket, payload: GetSnapshotDto): Promise<{
        ok: boolean;
    }>;
    handleAnswer(client: Socket, payload: AnswerQuestionDto): Promise<{
        ok: boolean;
    }>;
    handleLeaderboard(payload: LeaderboardDto): Promise<{
        ok: boolean;
    }>;
    handleAdminControl(payload: AdminControlDto): Promise<{
        ok: boolean;
        action: "start" | "pause" | "reset" | "end";
    }>;
    private buildTimeoutCallback;
    private getBoardSnapshot;
    private getTeamResets;
}
