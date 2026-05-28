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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomSchema = exports.Room = exports.RoomSettings = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let RoomSettings = class RoomSettings {
    shuffleQuestions;
    shuffleOptions;
    maxPlayers;
};
exports.RoomSettings = RoomSettings;
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], RoomSettings.prototype, "shuffleQuestions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], RoomSettings.prototype, "shuffleOptions", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], RoomSettings.prototype, "maxPlayers", void 0);
exports.RoomSettings = RoomSettings = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], RoomSettings);
let Room = class Room {
    pin;
    quizId;
    hostPlayerId;
    status;
    currentQuestionIndex;
    startedAt;
    endedAt;
    settings;
};
exports.Room = Room;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true }),
    __metadata("design:type", String)
], Room.prototype, "pin", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Quiz', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Room.prototype, "quizId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Room.prototype, "hostPlayerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'waiting' }),
    __metadata("design:type", String)
], Room.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Room.prototype, "currentQuestionIndex", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Room.prototype, "startedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Room.prototype, "endedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: RoomSettings, default: () => ({}) }),
    __metadata("design:type", RoomSettings)
], Room.prototype, "settings", void 0);
exports.Room = Room = __decorate([
    (0, mongoose_1.Schema)({ collection: 'rooms', timestamps: { createdAt: true, updatedAt: false } })
], Room);
exports.RoomSchema = mongoose_1.SchemaFactory.createForClass(Room);
//# sourceMappingURL=room.schema.js.map