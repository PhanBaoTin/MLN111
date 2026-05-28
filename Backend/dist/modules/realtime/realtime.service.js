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
exports.RealtimeService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const websockets_1 = require("@nestjs/websockets");
const mongoose_2 = require("mongoose");
const player_schema_1 = require("../player/player.schema");
const player_answer_schema_1 = require("../player-answer/player-answer.schema");
const quiz_schema_1 = require("../quiz/quiz.schema");
const room_schema_1 = require("../room/room.schema");
const room_state_service_1 = require("./room-state.service");
const SUBMIT_COOLDOWN_MS = 1_000;
const BOARD_SIZE = 9;
let RealtimeService = class RealtimeService {
    roomModel;
    quizModel;
    playerModel;
    playerAnswerModel;
    roomState;
    constructor(roomModel, quizModel, playerModel, playerAnswerModel, roomState) {
        this.roomModel = roomModel;
        this.quizModel = quizModel;
        this.playerModel = playerModel;
        this.playerAnswerModel = playerAnswerModel;
        this.roomState = roomState;
    }
    async findRoomByKey(roomKey) {
        if ((0, mongoose_2.isValidObjectId)(roomKey)) {
            return this.roomModel.findById(roomKey).exec();
        }
        return this.roomModel.findOne({ pin: roomKey }).exec();
    }
    async findRoom(payload) {
        if (payload.pin) {
            return this.roomModel.findOne({ pin: payload.pin }).exec();
        }
        if (payload.roomId && (0, mongoose_2.isValidObjectId)(payload.roomId)) {
            return this.roomModel.findById(payload.roomId).exec();
        }
        if (payload.roomId) {
            return this.roomModel.findOne({ pin: payload.roomId }).exec();
        }
        return null;
    }
    async joinRoom(payload, socketId) {
        const room = await this.findRoom(payload);
        if (!room)
            throw new websockets_1.WsException('Room not found');
        let player = await this.playerModel
            .findOne({ roomId: room._id, nickname: payload.nickname })
            .exec();
        if (player) {
            player.socketId = socketId;
            player.connected = true;
            if (payload.team)
                player.team = payload.team;
            await player.save();
        }
        else {
            player = await this.playerModel.create({
                roomId: room._id,
                socketId,
                nickname: payload.nickname,
                team: payload.team,
                score: 0,
                streak: 0,
                resetCount: 0,
                connected: true,
            });
        }
        return { room, player };
    }
    async markDisconnected(socketId) {
        const player = await this.playerModel
            .findOneAndUpdate({ socketId }, { connected: false, socketId: null }, { new: true })
            .exec();
        return { player };
    }
    async leaveRoom(payload, _socketId) {
        const player = await this.playerModel
            .findByIdAndUpdate(payload.playerId, { connected: false, socketId: null }, { new: true })
            .exec();
        return { player, roomId: payload.roomId };
    }
    async getSnapshot(payload, socketId) {
        const roomId = payload.roomId;
        let reconnectedPlayer = null;
        if (payload.playerId && (0, mongoose_2.isValidObjectId)(payload.playerId) && socketId) {
            reconnectedPlayer = await this.playerModel
                .findByIdAndUpdate(payload.playerId, { socketId, connected: true }, { new: true })
                .exec();
        }
        const snap = this.roomState.snapshot(roomId);
        const leaderboard = await this.getLeaderboard(roomId);
        const players = await this.playerModel.find({ roomId: new mongoose_2.Types.ObjectId(roomId) }).exec();
        const connectedCount = players.filter((p) => p.connected).length;
        const room = await this.roomModel.findById(roomId).exec();
        const pin = room?.pin ?? '';
        const quiz = room ? await this.quizModel.findById(room.quizId).exec() : null;
        const imageBase64 = quiz?.imageBase64 ?? null;
        return { snapshot: snap, leaderboard, connectedPlayers: connectedCount, pin, imageBase64, reconnectedPlayer };
    }
    async submitAnswer(payload, onTimeout) {
        const room = await this.roomModel.findById(payload.roomId).exec();
        if (!room)
            throw new websockets_1.WsException('Room not found');
        const state = this.roomState.get(payload.roomId);
        if (!state)
            throw new websockets_1.WsException('Game not started');
        if (state.phase !== 'playing')
            throw new websockets_1.WsException('Game is not in playing phase');
        const lastSubmit = state.submitCooldown.get(payload.playerId) ?? 0;
        if (Date.now() - lastSubmit < SUBMIT_COOLDOWN_MS) {
            throw new websockets_1.WsException('Submit too fast – slow down');
        }
        state.submitCooldown.set(payload.playerId, Date.now());
        const quiz = await this.quizModel.findById(room.quizId).exec();
        if (!quiz)
            throw new websockets_1.WsException('Quiz not found');
        const question = quiz.questions.find((q) => q.id === payload.questionId);
        if (!question)
            throw new websockets_1.WsException('Question not found');
        const option = question.options.find((o) => o.id === payload.selectedOptionId);
        const isCorrect = Boolean(option?.isCorrect);
        let earnedScore = 0;
        if (isCorrect) {
            const speedBonus = payload.responseTime < question.timeLimit * 500
                ? Math.round(50 * (1 - payload.responseTime / (question.timeLimit * 1000)))
                : 0;
            earnedScore = question.points + speedBonus;
        }
        await this.playerAnswerModel.create({
            roomId: room._id,
            playerId: payload.playerId,
            questionId: payload.questionId,
            selectedOptionId: payload.selectedOptionId,
            isCorrect,
            responseTime: payload.responseTime,
            earnedScore,
        });
        const playerUpdate = isCorrect
            ? { $inc: { score: earnedScore, streak: 1 } }
            : { $set: { streak: 0 }, $inc: { resetCount: 1 } };
        const player = await this.playerModel
            .findByIdAndUpdate(payload.playerId, playerUpdate, { new: true })
            .exec();
        const team = player?.team;
        let clearedTileIndex = null;
        let resetBoard = false;
        let winEvent = null;
        if (team && (team === 'red' || team === 'blue')) {
            const board = state.teamBoards[team];
            if (isCorrect) {
                for (let i = 0; i < BOARD_SIZE; i++) {
                    if (!board.clearedTiles.has(i)) {
                        board.clearedTiles.add(i);
                        clearedTileIndex = i;
                        break;
                    }
                }
                if (board.clearedTiles.size === BOARD_SIZE) {
                    board.tilesWonAt = Date.now();
                    winEvent = { winner: team };
                    await this.resolveWin(payload.roomId, team, state, onTimeout);
                }
            }
            else {
                board.clearedTiles.clear();
                board.resets += 1;
                resetBoard = true;
            }
        }
        const leaderboard = await this.getLeaderboard(room._id.toString());
        return {
            player,
            isCorrect,
            earnedScore,
            leaderboard,
            shouldReset: !isCorrect,
            clearedTileIndex,
            resetBoard,
            team: team ?? null,
            winEvent,
        };
    }
    async handleAdminControl(payload, onTimeout) {
        const state = this.roomState.get(payload.roomId);
        if (payload.action !== 'start') {
            if (!state)
                throw new websockets_1.WsException('Room state not initialised');
            if (state.hostToken !== payload.hostToken)
                throw new websockets_1.WsException('Unauthorized: invalid host token');
        }
        const updates = {};
        if (payload.action === 'start') {
            const room = await this.roomModel.findById(payload.roomId).exec();
            if (!room)
                throw new websockets_1.WsException('Room not found');
            const quiz = await this.quizModel.findById(room.quizId).exec();
            if (!quiz)
                throw new websockets_1.WsException('Quiz not found');
            if (!quiz.questions.length)
                throw new websockets_1.WsException('Quiz has no questions');
            if (!state) {
                this.roomState.init(payload.roomId, room.quizId.toString(), quiz.questions.length, payload.hostToken, room.settings.shuffleQuestions);
            }
            else {
                if (state.hostToken !== payload.hostToken)
                    throw new websockets_1.WsException('Unauthorized: invalid host token');
            }
            const s = this.roomState.get(payload.roomId);
            s.phase = 'playing';
            s.startedAt = s.startedAt ?? Date.now();
            const currentQ = quiz.questions[s.questionOrder[s.currentQuestionIndex]];
            const timeLimitMs = (currentQ?.timeLimit ?? 30) * 1000;
            s.timerEndsAt = Date.now() + timeLimitMs;
            this.roomState.clearTimer(payload.roomId);
            const handle = setTimeout(async () => {
                await this.handleQuestionTimeout(payload.roomId, onTimeout);
            }, timeLimitMs);
            this.roomState.setTimerHandle(payload.roomId, handle);
            updates.status = 'playing';
            updates.startedAt = new Date(s.startedAt);
        }
        if (payload.action === 'pause') {
            state.phase = 'paused';
            this.roomState.clearTimer(payload.roomId);
            updates.status = 'waiting';
        }
        if (payload.action === 'reset') {
            const room = await this.roomModel.findById(payload.roomId).exec();
            const quiz = await this.quizModel.findById(room?.quizId).exec();
            const questionCount = quiz?.questions.length ?? 0;
            this.roomState.init(payload.roomId, state.quizId, questionCount, payload.hostToken, room?.settings.shuffleQuestions ?? false);
            await this.playerModel.updateMany({ roomId: payload.roomId }, { $set: { score: 0, streak: 0, resetCount: 0 } });
            updates.status = 'waiting';
            updates.currentQuestionIndex = 0;
        }
        if (payload.action === 'end') {
            this.roomState.clearTimer(payload.roomId);
            state.phase = 'finished';
            const winner = this.determineWinnerByTiles(payload.roomId);
            state.winnerId = winner;
            updates.status = 'finished';
            updates.endedAt = new Date();
        }
        const room = await this.roomModel
            .findByIdAndUpdate(payload.roomId, updates, { new: true })
            .exec();
        if (!room)
            throw new websockets_1.WsException('Room not found');
        const snap = this.roomState.snapshot(payload.roomId);
        return { room, action: payload.action, snapshot: snap };
    }
    async handleQuestionTimeout(roomId, onTimeout) {
        const state = this.roomState.get(roomId);
        if (!state || state.phase !== 'playing')
            return;
        const quiz = await this.quizModel.findById(state.quizId).exec();
        if (!quiz)
            return;
        const nextIndex = state.currentQuestionIndex + 1;
        if (nextIndex >= quiz.questions.length) {
            state.phase = 'finished';
            state.timerHandle = null;
            const winner = this.determineWinnerByTiles(roomId);
            state.winnerId = winner;
            await this.roomModel.findByIdAndUpdate(roomId, { status: 'finished', endedAt: new Date() }).exec();
            onTimeout(roomId, winner);
            return;
        }
        state.currentQuestionIndex = nextIndex;
        await this.roomModel.findByIdAndUpdate(roomId, { currentQuestionIndex: nextIndex }).exec();
        const currentQ = quiz.questions[state.questionOrder[nextIndex]];
        const timeLimitMs = (currentQ?.timeLimit ?? 30) * 1000;
        state.timerEndsAt = Date.now() + timeLimitMs;
        const handle = setTimeout(async () => {
            await this.handleQuestionTimeout(roomId, onTimeout);
        }, timeLimitMs);
        this.roomState.setTimerHandle(roomId, handle);
        onTimeout(roomId, null);
    }
    async resolveWin(roomId, winner, state, onTimeout) {
        this.roomState.clearTimer(roomId);
        state.phase = 'finished';
        state.winnerId = winner;
        await this.roomModel.findByIdAndUpdate(roomId, { status: 'finished', endedAt: new Date() }).exec();
        onTimeout(roomId, winner);
    }
    determineWinnerByTiles(roomId) {
        const state = this.roomState.get(roomId);
        if (!state)
            return 'tie';
        const redTiles = state.teamBoards.red.clearedTiles.size;
        const blueTiles = state.teamBoards.blue.clearedTiles.size;
        if (redTiles > blueTiles)
            return 'red';
        if (blueTiles > redTiles)
            return 'blue';
        return 'tie';
    }
    async getLeaderboard(roomId) {
        const players = await this.playerModel
            .find({ roomId: new mongoose_2.Types.ObjectId(roomId) })
            .sort({ score: -1, resetCount: 1, streak: -1, joinedAt: 1 })
            .exec();
        return players.map((p) => ({
            id: p._id.toString(),
            nickname: p.nickname,
            team: p.team ?? null,
            score: p.score,
            resetCount: p.resetCount,
            streak: p.streak,
            connected: p.connected,
        }));
    }
    async getRoomState(roomKey) {
        const room = await this.findRoomByKey(roomKey);
        if (!room)
            throw new websockets_1.WsException('Room not found');
        const roomId = room.id.toString();
        const players = await this.playerModel.find({ roomId: new mongoose_2.Types.ObjectId(roomId) }).exec();
        const leaderboard = await this.getLeaderboard(roomId);
        const snap = this.roomState.snapshot(roomId);
        const teamStats = players.reduce((acc, player) => {
            const team = player.team ?? 'unassigned';
            const current = acc[team] ?? { total: 0, connected: 0 };
            current.total += 1;
            if (player.connected)
                current.connected += 1;
            acc[team] = current;
            return acc;
        }, {});
        return {
            room: {
                id: room.id,
                pin: room.pin,
                status: room.status,
                currentQuestionIndex: room.currentQuestionIndex,
                startedAt: room.startedAt ?? null,
                endedAt: room.endedAt ?? null,
                settings: room.settings,
            },
            stats: {
                totalPlayers: players.length,
                connectedPlayers: players.filter((p) => p.connected).length,
                teamStats,
            },
            leaderboard,
            realtimeState: snap,
        };
    }
    async getLeaderboardByKey(roomKey) {
        const room = await this.findRoomByKey(roomKey);
        if (!room)
            throw new websockets_1.WsException('Room not found');
        return this.getLeaderboard(room.id.toString());
    }
    async getPlayersByKey(roomKey, filters) {
        const room = await this.findRoomByKey(roomKey);
        if (!room)
            throw new websockets_1.WsException('Room not found');
        const query = { roomId: new mongoose_2.Types.ObjectId(room.id) };
        if (filters?.team) {
            if (filters.team === 'unassigned') {
                query.$or = [{ team: null }, { team: { $exists: false } }];
            }
            else {
                query.team = filters.team;
            }
        }
        if (typeof filters?.connected === 'boolean') {
            query.connected = filters.connected;
        }
        const players = await this.playerModel.find(query).sort({ joinedAt: 1 }).exec();
        return players.map((p) => ({
            id: p._id.toString(),
            nickname: p.nickname,
            team: p.team ?? null,
            score: p.score,
            resetCount: p.resetCount,
            streak: p.streak,
            connected: p.connected,
            joinedAt: p.joinedAt ?? null,
        }));
    }
    async getQuestionsForRoom(roomId) {
        const state = this.roomState.get(roomId);
        if (!state)
            return null;
        const quiz = await this.quizModel.findById(state.quizId).exec();
        if (!quiz)
            return null;
        return state.questionOrder.map((qi, displayIndex) => {
            const q = quiz.questions[qi];
            return {
                displayIndex,
                id: q.id,
                text: q.text,
                timeLimit: q.timeLimit,
                points: q.points,
                options: q.options.map((o) => ({ id: o.id, text: o.text })),
            };
        });
    }
};
exports.RealtimeService = RealtimeService;
exports.RealtimeService = RealtimeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(room_schema_1.Room.name)),
    __param(1, (0, mongoose_1.InjectModel)(quiz_schema_1.Quiz.name)),
    __param(2, (0, mongoose_1.InjectModel)(player_schema_1.Player.name)),
    __param(3, (0, mongoose_1.InjectModel)(player_answer_schema_1.PlayerAnswer.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        room_state_service_1.RoomStateService])
], RealtimeService);
//# sourceMappingURL=realtime.service.js.map