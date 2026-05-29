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
exports.QuickCreateRoomDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const create_quiz_dto_1 = require("../../quiz/dto/create-quiz.dto");
class QuickCreateRoomDto {
    title;
    description;
    imageBase64;
    visibility;
    questions;
    pin;
    shuffleQuestions;
    shuffleOptions;
    maxTeams;
    globalTimeLimit;
}
exports.QuickCreateRoomDto = QuickCreateRoomDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QuickCreateRoomDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QuickCreateRoomDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QuickCreateRoomDto.prototype, "imageBase64", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['public', 'private']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QuickCreateRoomDto.prototype, "visibility", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_quiz_dto_1.CreateQuizQuestionDto),
    __metadata("design:type", Array)
], QuickCreateRoomDto.prototype, "questions", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QuickCreateRoomDto.prototype, "pin", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], QuickCreateRoomDto.prototype, "shuffleQuestions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], QuickCreateRoomDto.prototype, "shuffleOptions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2),
    __metadata("design:type", Number)
], QuickCreateRoomDto.prototype, "maxTeams", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], QuickCreateRoomDto.prototype, "globalTimeLimit", void 0);
//# sourceMappingURL=quick-create-room.dto.js.map