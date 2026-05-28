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
exports.RoomService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const crypto_1 = require("crypto");
const quiz_schema_1 = require("../quiz/quiz.schema");
const room_schema_1 = require("./room.schema");
let RoomService = class RoomService {
    roomModel;
    quizModel;
    constructor(roomModel, quizModel) {
        this.roomModel = roomModel;
        this.quizModel = quizModel;
    }
    async create(dto) {
        return this.roomModel.create({
            pin: dto.pin,
            quizId: new mongoose_2.Types.ObjectId(dto.quizId),
            hostPlayerId: dto.hostPlayerId,
            status: 'waiting',
            currentQuestionIndex: dto.currentQuestionIndex ?? 0,
            settings: {
                shuffleQuestions: dto.shuffleQuestions ?? false,
                shuffleOptions: dto.shuffleOptions ?? false,
                maxPlayers: dto.maxPlayers,
            },
        });
    }
    async quickCreate(dto) {
        const hostToken = (0, crypto_1.randomUUID)();
        const quiz = await this.quizModel.create({
            title: dto.title,
            description: dto.description,
            visibility: dto.visibility ?? 'private',
            imageBase64: dto.imageBase64,
            questions: dto.questions,
        });
        const room = await this.roomModel.create({
            pin: dto.pin,
            quizId: quiz._id,
            hostPlayerId: 'admin',
            status: 'waiting',
            currentQuestionIndex: 0,
            settings: {
                shuffleQuestions: dto.shuffleQuestions ?? false,
                shuffleOptions: dto.shuffleOptions ?? false,
                maxPlayers: dto.maxPlayers,
            },
        });
        return {
            quiz,
            room,
            hostToken,
        };
    }
    async launchExisting(dto) {
        const hostToken = (0, crypto_1.randomUUID)();
        const quiz = await this.quizModel.findById(dto.quizId).exec();
        if (!quiz)
            throw new common_1.NotFoundException('Quiz not found');
        const room = await this.roomModel.create({
            pin: dto.pin,
            quizId: quiz._id,
            hostPlayerId: 'admin',
            status: 'waiting',
            currentQuestionIndex: 0,
            settings: {
                shuffleQuestions: dto.shuffleQuestions ?? false,
                shuffleOptions: dto.shuffleOptions ?? false,
                maxPlayers: dto.maxPlayers,
            },
        });
        return {
            quiz,
            room,
            hostToken,
        };
    }
    async findAll() {
        return this.roomModel.find().exec();
    }
    async findById(id) {
        const room = await this.roomModel.findById(id).exec();
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        return room;
    }
    async update(id, dto) {
        const room = await this.roomModel
            .findByIdAndUpdate(id, {
            ...dto,
            quizId: dto.quizId ? new mongoose_2.Types.ObjectId(dto.quizId) : undefined,
            settings: {
                shuffleQuestions: dto.shuffleQuestions,
                shuffleOptions: dto.shuffleOptions,
                maxPlayers: dto.maxPlayers,
            },
        }, { new: true })
            .exec();
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        return room;
    }
    async remove(id) {
        const room = await this.roomModel.findByIdAndDelete(id).exec();
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        return room;
    }
};
exports.RoomService = RoomService;
exports.RoomService = RoomService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(room_schema_1.Room.name)),
    __param(1, (0, mongoose_1.InjectModel)(quiz_schema_1.Quiz.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], RoomService);
//# sourceMappingURL=room.service.js.map