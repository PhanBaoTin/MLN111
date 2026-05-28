"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeModule = void 0;
const common_1 = require("@nestjs/common");
const player_answer_module_1 = require("../player-answer/player-answer.module");
const player_module_1 = require("../player/player.module");
const quiz_module_1 = require("../quiz/quiz.module");
const room_module_1 = require("../room/room.module");
const realtime_controller_1 = require("./realtime.controller");
const realtime_gateway_1 = require("./realtime.gateway");
const realtime_service_1 = require("./realtime.service");
const room_state_service_1 = require("./room-state.service");
let RealtimeModule = class RealtimeModule {
};
exports.RealtimeModule = RealtimeModule;
exports.RealtimeModule = RealtimeModule = __decorate([
    (0, common_1.Module)({
        imports: [room_module_1.RoomModule, quiz_module_1.QuizModule, player_module_1.PlayerModule, player_answer_module_1.PlayerAnswerModule],
        controllers: [realtime_controller_1.RealtimeController],
        providers: [realtime_gateway_1.RealtimeGateway, realtime_service_1.RealtimeService, room_state_service_1.RoomStateService],
    })
], RealtimeModule);
//# sourceMappingURL=realtime.module.js.map