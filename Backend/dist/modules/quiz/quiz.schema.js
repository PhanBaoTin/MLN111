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
exports.QuizSchema = exports.Quiz = exports.QuizQuestionSchema = exports.QuizQuestion = exports.QuizOptionSchema = exports.QuizOption = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let QuizOption = class QuizOption {
    id;
    text;
    isCorrect;
};
exports.QuizOption = QuizOption;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], QuizOption.prototype, "id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], QuizOption.prototype, "text", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Boolean)
], QuizOption.prototype, "isCorrect", void 0);
exports.QuizOption = QuizOption = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], QuizOption);
exports.QuizOptionSchema = mongoose_1.SchemaFactory.createForClass(QuizOption);
let QuizQuestion = class QuizQuestion {
    id;
    text;
    type;
    timeLimit;
    points;
    order;
    options;
};
exports.QuizQuestion = QuizQuestion;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], QuizQuestion.prototype, "id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], QuizQuestion.prototype, "text", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'single_choice' }),
    __metadata("design:type", String)
], QuizQuestion.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], QuizQuestion.prototype, "timeLimit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], QuizQuestion.prototype, "points", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], QuizQuestion.prototype, "order", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.QuizOptionSchema], default: [] }),
    __metadata("design:type", Array)
], QuizQuestion.prototype, "options", void 0);
exports.QuizQuestion = QuizQuestion = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], QuizQuestion);
exports.QuizQuestionSchema = mongoose_1.SchemaFactory.createForClass(QuizQuestion);
let Quiz = class Quiz {
    title;
    description;
    visibility;
    imageBase64;
    questions;
};
exports.Quiz = Quiz;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Quiz.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Quiz.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'private' }),
    __metadata("design:type", String)
], Quiz.prototype, "visibility", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Quiz.prototype, "imageBase64", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.QuizQuestionSchema], default: [] }),
    __metadata("design:type", Array)
], Quiz.prototype, "questions", void 0);
exports.Quiz = Quiz = __decorate([
    (0, mongoose_1.Schema)({ collection: 'quizzes', timestamps: true })
], Quiz);
exports.QuizSchema = mongoose_1.SchemaFactory.createForClass(Quiz);
//# sourceMappingURL=quiz.schema.js.map