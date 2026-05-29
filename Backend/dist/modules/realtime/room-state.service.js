"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomStateService = exports.TEAM_COLORS = void 0;
const common_1 = require("@nestjs/common");
exports.TEAM_COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'cyan', 'pink'];
let RoomStateService = class RoomStateService {
    rooms = new Map();
    init(roomId, quizId, questionCount, hostToken, shuffle = false, maxTeams = 2) {
        const existing = this.rooms.get(roomId);
        if (existing?.timerHandle)
            clearTimeout(existing.timerHandle);
        if (existing?.globalTimerHandle)
            clearTimeout(existing.globalTimerHandle);
        const order = Array.from({ length: questionCount }, (_, i) => i);
        if (shuffle) {
            for (let i = order.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [order[i], order[j]] = [order[j], order[i]];
            }
        }
        const teamBoards = {};
        for (let i = 0; i < maxTeams && i < exports.TEAM_COLORS.length; i++) {
            teamBoards[exports.TEAM_COLORS[i]] = { clearedTiles: new Set(), resets: 0 };
        }
        const state = {
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
    get(roomId) {
        return this.rooms.get(roomId);
    }
    has(roomId) {
        return this.rooms.has(roomId);
    }
    delete(roomId) {
        const state = this.rooms.get(roomId);
        if (state?.timerHandle)
            clearTimeout(state.timerHandle);
        if (state?.globalTimerHandle)
            clearTimeout(state.globalTimerHandle);
        this.rooms.delete(roomId);
    }
    setTimerHandle(roomId, handle) {
        const state = this.rooms.get(roomId);
        if (state)
            state.timerHandle = handle;
    }
    setGlobalTimerHandle(roomId, handle) {
        const state = this.rooms.get(roomId);
        if (state)
            state.globalTimerHandle = handle;
    }
    clearTimer(roomId) {
        const state = this.rooms.get(roomId);
        if (state?.timerHandle) {
            clearTimeout(state.timerHandle);
            state.timerHandle = null;
        }
    }
    clearGlobalTimer(roomId) {
        const state = this.rooms.get(roomId);
        if (state?.globalTimerHandle) {
            clearTimeout(state.globalTimerHandle);
            state.globalTimerHandle = null;
        }
    }
    snapshot(roomId) {
        const s = this.rooms.get(roomId);
        if (!s)
            return null;
        const teamBoardsSnapshot = {};
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
};
exports.RoomStateService = RoomStateService;
exports.RoomStateService = RoomStateService = __decorate([
    (0, common_1.Injectable)()
], RoomStateService);
//# sourceMappingURL=room-state.service.js.map