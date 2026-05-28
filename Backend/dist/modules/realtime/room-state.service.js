"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomStateService = void 0;
const common_1 = require("@nestjs/common");
let RoomStateService = class RoomStateService {
    rooms = new Map();
    init(roomId, quizId, questionCount, hostToken, shuffle = false) {
        const existing = this.rooms.get(roomId);
        if (existing?.timerHandle)
            clearTimeout(existing.timerHandle);
        const order = Array.from({ length: questionCount }, (_, i) => i);
        if (shuffle) {
            for (let i = order.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [order[i], order[j]] = [order[j], order[i]];
            }
        }
        const state = {
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
        this.rooms.delete(roomId);
    }
    setTimerHandle(roomId, handle) {
        const state = this.rooms.get(roomId);
        if (state)
            state.timerHandle = handle;
    }
    clearTimer(roomId) {
        const state = this.rooms.get(roomId);
        if (state?.timerHandle) {
            clearTimeout(state.timerHandle);
            state.timerHandle = null;
        }
    }
    snapshot(roomId) {
        const s = this.rooms.get(roomId);
        if (!s)
            return null;
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
};
exports.RoomStateService = RoomStateService;
exports.RoomStateService = RoomStateService = __decorate([
    (0, common_1.Injectable)()
], RoomStateService);
//# sourceMappingURL=room-state.service.js.map