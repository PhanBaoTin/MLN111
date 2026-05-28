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
exports.PlayerSchema = exports.Player = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Player = class Player {
    roomId;
    socketId;
    nickname;
    team;
    score;
    streak;
    resetCount;
    connected;
    joinedAt;
};
exports.Player = Player;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Room', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Player.prototype, "roomId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", Object)
], Player.prototype, "socketId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Player.prototype, "nickname", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['red', 'blue'] }),
    __metadata("design:type", String)
], Player.prototype, "team", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Player.prototype, "score", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Player.prototype, "streak", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Player.prototype, "resetCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], Player.prototype, "connected", void 0);
exports.Player = Player = __decorate([
    (0, mongoose_1.Schema)({ collection: 'players', timestamps: { createdAt: 'joinedAt', updatedAt: false } })
], Player);
exports.PlayerSchema = mongoose_1.SchemaFactory.createForClass(Player);
//# sourceMappingURL=player.schema.js.map