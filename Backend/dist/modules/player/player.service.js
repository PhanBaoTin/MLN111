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
exports.PlayerService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const player_schema_1 = require("./player.schema");
let PlayerService = class PlayerService {
    playerModel;
    constructor(playerModel) {
        this.playerModel = playerModel;
    }
    async create(dto) {
        return this.playerModel.create({
            roomId: new mongoose_2.Types.ObjectId(dto.roomId),
            nickname: dto.nickname,
            team: dto.team,
            score: 0,
            streak: 0,
            resetCount: 0,
            connected: true,
        });
    }
    async findAll(roomId) {
        if (roomId) {
            return this.playerModel.find({ roomId: new mongoose_2.Types.ObjectId(roomId) }).exec();
        }
        return this.playerModel.find().exec();
    }
    async findById(id) {
        const player = await this.playerModel.findById(id).exec();
        if (!player) {
            throw new common_1.NotFoundException('Player not found');
        }
        return player;
    }
    async update(id, dto) {
        const player = await this.playerModel
            .findByIdAndUpdate(id, {
            ...dto,
            roomId: dto.roomId ? new mongoose_2.Types.ObjectId(dto.roomId) : undefined,
        }, { new: true })
            .exec();
        if (!player) {
            throw new common_1.NotFoundException('Player not found');
        }
        return player;
    }
    async remove(id) {
        const player = await this.playerModel.findByIdAndDelete(id).exec();
        if (!player) {
            throw new common_1.NotFoundException('Player not found');
        }
        return player;
    }
};
exports.PlayerService = PlayerService;
exports.PlayerService = PlayerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(player_schema_1.Player.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PlayerService);
//# sourceMappingURL=player.service.js.map