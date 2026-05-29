"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeGateway = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const admin_control_dto_1 = require("./dto/admin-control.dto");
const answer_question_dto_1 = require("./dto/answer-question.dto");
const get_snapshot_dto_1 = require("./dto/get-snapshot.dto");
const join_room_dto_1 = require("./dto/join-room.dto");
const leaderboard_dto_1 = require("./dto/leaderboard.dto");
const leave_room_dto_1 = require("./dto/leave-room.dto");
const realtime_service_1 = require("./realtime.service");
const WS_PIPE = new common_1.ValidationPipe({
    whitelist: true,
    transform: true,
    forbidUnknownValues: false,
});
let RealtimeGateway = class RealtimeGateway {
    realtimeService;
    server;
    constructor(realtimeService) {
        this.realtimeService = realtimeService;
    }
    afterInit(_server) {
    }
    handleConnection(client) {
        client.emit('socket:connected', { socketId: client.id });
    }
    async handleDisconnect(client) {
        const result = await this.realtimeService.markDisconnected(client.id);
        if (result.player && result.player.roomId) {
            const roomId = result.player.roomId.toString();
            this.server.to(roomId).emit('room:player-left', {
                socketId: client.id,
                playerId: result.player.id,
                connected: false,
            });
            const leaderboard = await this.realtimeService.getLeaderboard(roomId);
            this.server.to(roomId).emit('game:leaderboard', { roomId, leaderboard });
        }
    }
    async handleRoomInfo(payload) {
        try {
            const info = await this.realtimeService.getRoomInfoByKey(payload.key);
            return { ok: true, info };
        }
        catch (err) {
            return { ok: false, message: err.message };
        }
    }
    async handleRoomJoin(client, payload) {
        const { room, player } = await this.realtimeService.joinRoom(payload, client.id);
        const roomId = room.id.toString();
        client.join(roomId);
        this.server.to(roomId).emit('room:player-joined', {
            roomId,
            player: {
                id: player._id.toString(),
                nickname: player.nickname,
                team: player.team ?? null,
                score: player.score,
                streak: player.streak,
            },
        });
        const leaderboard = await this.realtimeService.getLeaderboard(roomId);
        this.server.to(roomId).emit('game:leaderboard', { roomId, leaderboard });
        return { ok: true, roomId, playerId: player._id.toString(), team: player.team };
    }
    async handleRoomLeave(client, payload) {
        client.leave(payload.roomId);
        const { player, roomId } = await this.realtimeService.leaveRoom(payload, client.id);
        this.server.to(roomId).emit('room:player-left', {
            socketId: client.id,
            playerId: payload.playerId,
            connected: player?.connected ?? false,
        });
        const leaderboard = await this.realtimeService.getLeaderboard(roomId);
        this.server.to(roomId).emit('game:leaderboard', { roomId, leaderboard });
        return { ok: true, roomId, playerId: payload.playerId };
    }
    async handleSnapshot(client, payload) {
        client.join(payload.roomId);
        const data = await this.realtimeService.getSnapshot(payload, client.id);
        const questions = await this.realtimeService.getQuestionsForRoom(payload.roomId);
        if (data.reconnectedPlayer) {
            this.server.to(payload.roomId).emit('room:player-joined', {
                roomId: payload.roomId,
                player: {
                    id: data.reconnectedPlayer._id.toString(),
                    nickname: data.reconnectedPlayer.nickname,
                    team: data.reconnectedPlayer.team ?? null,
                    score: data.reconnectedPlayer.score,
                    streak: data.reconnectedPlayer.streak,
                },
            });
            const leaderboard = await this.realtimeService.getLeaderboard(payload.roomId);
            this.server.to(payload.roomId).emit('game:leaderboard', { roomId: payload.roomId, leaderboard });
        }
        client.emit('room:state-snapshot', { ...data, questions });
        return { ok: true };
    }
    async handleAnswer(client, payload) {
        const onTimeout = this.buildTimeoutCallback();
        const result = await this.realtimeService.submitAnswer(payload, onTimeout);
        this.server.to(payload.roomId).emit('game:answer-result', {
            roomId: payload.roomId,
            playerId: payload.playerId,
            questionId: payload.questionId,
            selectedOptionId: payload.selectedOptionId,
            responseTime: payload.responseTime,
            isCorrect: result.isCorrect,
            earnedScore: result.earnedScore,
            streak: result.player?.streak ?? 0,
            score: result.player?.score ?? 0,
            team: result.team,
            socketId: client.id,
        });
        if (result.clearedTileIndex !== null || result.resetBoard) {
            this.server.to(payload.roomId).emit('game:board-update', {
                roomId: payload.roomId,
                team: result.team,
                clearedTileIndex: result.clearedTileIndex,
                resetBoard: result.resetBoard,
                clearedTiles: this.getBoardSnapshot(payload.roomId, result.team),
                resets: this.getTeamResets(payload.roomId, result.team),
            });
        }
        if (result.shouldReset) {
            this.server.to(payload.roomId).emit('game:reset', {
                roomId: payload.roomId,
                playerId: payload.playerId,
                team: result.team,
            });
        }
        this.server.to(payload.roomId).emit('game:leaderboard', {
            roomId: payload.roomId,
            leaderboard: result.leaderboard,
        });
        if (result.winEvent) {
            this.server.to(payload.roomId).emit('game:winner', {
                roomId: payload.roomId,
                winner: result.winEvent.winner,
            });
        }
        return { ok: true };
    }
    async handleLeaderboard(payload) {
        const leaderboard = await this.realtimeService.getLeaderboard(payload.roomId);
        this.server.to(payload.roomId).emit('game:leaderboard', { roomId: payload.roomId, leaderboard });
        return { ok: true };
    }
    async handleAdminControl(payload) {
        const onTimeout = this.buildTimeoutCallback();
        const result = await this.realtimeService.handleAdminControl(payload, onTimeout);
        this.server.to(payload.roomId).emit(`admin:${payload.action}`, {
            action: payload.action,
            snapshot: result.snapshot,
            roomStatus: result.room.status,
        });
        if (payload.action === 'start') {
            const questions = await this.realtimeService.getQuestionsForRoom(payload.roomId);
            this.server.to(payload.roomId).emit('game:questions', {
                roomId: payload.roomId,
                questions,
                currentIndex: result.snapshot?.currentQuestionIndex ?? 0,
                timerEndsAt: result.snapshot?.timerEndsAt ?? null,
            });
        }
        return { ok: true, action: payload.action };
    }
    buildTimeoutCallback() {
        return (roomId, winner) => {
            if (winner !== null) {
                this.server.to(roomId).emit('game:winner', { roomId, winner });
            }
            else {
                void this.realtimeService.getQuestionsForRoom(roomId).then((questions) => {
                    if (!questions)
                        return;
                    void this.realtimeService['roomState'].get(roomId);
                    const snap = this.realtimeService['roomState'].snapshot(roomId);
                    this.server.to(roomId).emit('game:next-question', {
                        roomId,
                        currentIndex: snap?.currentQuestionIndex ?? 0,
                        timerEndsAt: snap?.timerEndsAt ?? null,
                        currentQuestion: questions[snap?.currentQuestionIndex ?? 0],
                    });
                });
            }
        };
    }
    getBoardSnapshot(roomId, team) {
        const state = this.realtimeService['roomState'].get(roomId);
        return state && state.teamBoards[team] ? Array.from(state.teamBoards[team].clearedTiles) : [];
    }
    getTeamResets(roomId, team) {
        const state = this.realtimeService['roomState'].get(roomId);
        return state?.teamBoards[team]?.resets ?? 0;
    }
};
exports.RealtimeGateway = RealtimeGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RealtimeGateway.prototype, "server", void 0);
__decorate([
    (0, common_1.UsePipes)(WS_PIPE),
    (0, websockets_1.SubscribeMessage)('room:info'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "handleRoomInfo", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('room:join'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, join_room_dto_1.JoinRoomDto]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "handleRoomJoin", null);
__decorate([
    (0, common_1.UsePipes)(WS_PIPE),
    (0, websockets_1.SubscribeMessage)('room:leave'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, leave_room_dto_1.LeaveRoomDto]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "handleRoomLeave", null);
__decorate([
    (0, common_1.UsePipes)(WS_PIPE),
    (0, websockets_1.SubscribeMessage)('room:snapshot'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, get_snapshot_dto_1.GetSnapshotDto]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "handleSnapshot", null);
__decorate([
    (0, common_1.UsePipes)(WS_PIPE),
    (0, websockets_1.SubscribeMessage)('game:answer'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, answer_question_dto_1.AnswerQuestionDto]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "handleAnswer", null);
__decorate([
    (0, common_1.UsePipes)(WS_PIPE),
    (0, websockets_1.SubscribeMessage)('game:leaderboard'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [leaderboard_dto_1.LeaderboardDto]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "handleLeaderboard", null);
__decorate([
    (0, common_1.UsePipes)(WS_PIPE),
    (0, websockets_1.SubscribeMessage)('admin:control'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_control_dto_1.AdminControlDto]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "handleAdminControl", null);
exports.RealtimeGateway = RealtimeGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: true, credentials: true },
    }),
    __metadata("design:paramtypes", [realtime_service_1.RealtimeService])
], RealtimeGateway);
//# sourceMappingURL=realtime.gateway.js.map