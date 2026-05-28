"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const crypto_1 = require("crypto");
const mammoth = __importStar(require("mammoth"));
const quiz_schema_1 = require("./quiz.schema");
let QuizService = class QuizService {
    quizModel;
    constructor(quizModel) {
        this.quizModel = quizModel;
    }
    async create(dto) {
        return this.quizModel.create(dto);
    }
    async findAll() {
        return this.quizModel.find().select('-imageBase64').exec();
    }
    async findById(id) {
        const quiz = await this.quizModel.findById(id).exec();
        if (!quiz)
            throw new common_1.NotFoundException('Quiz not found');
        return quiz;
    }
    async update(id, dto) {
        const quiz = await this.quizModel.findByIdAndUpdate(id, dto, { new: true }).exec();
        if (!quiz)
            throw new common_1.NotFoundException('Quiz not found');
        return quiz;
    }
    async remove(id) {
        const quiz = await this.quizModel.findByIdAndDelete(id).exec();
        if (!quiz)
            throw new common_1.NotFoundException('Quiz not found');
        return quiz;
    }
    async parseDocx(buffer) {
        const result = await mammoth.extractRawText({ buffer });
        const raw = result.value;
        const rawWarnings = result.messages.map((m) => m.message);
        const lines = raw
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean);
        const questions = [];
        const OPTION_REGEX = /^([A-Da-d])[.):]\s+(.+)$/;
        const ANSWER_REGEX = /^(?:đáp án|answer|correct)[:\s]+([A-Da-d])/i;
        const QUESTION_PREFIX = /^(?:câu\s*\d+[.:]?\s*|\d+[.)]\s*)/i;
        let currentQuestion = null;
        let order = 0;
        const flush = () => {
            if (currentQuestion && currentQuestion.text && currentQuestion.options.length >= 2) {
                questions.push(currentQuestion);
                order++;
            }
            currentQuestion = null;
        };
        for (const line of lines) {
            const optionMatch = OPTION_REGEX.exec(line);
            const answerMatch = ANSWER_REGEX.exec(line);
            if (answerMatch) {
                if (currentQuestion) {
                    const letter = answerMatch[1].toUpperCase();
                    for (const opt of currentQuestion.options) {
                        const optLetter = String.fromCharCode(65 + currentQuestion.options.indexOf(opt));
                        opt.isCorrect = optLetter === letter;
                    }
                }
            }
            else if (optionMatch && currentQuestion) {
                currentQuestion.options.push({
                    id: (0, crypto_1.randomUUID)(),
                    text: optionMatch[2].trim(),
                    isCorrect: false,
                });
            }
            else {
                const isNewQuestion = QUESTION_PREFIX.test(line) ||
                    (!optionMatch && !answerMatch && currentQuestion === null) ||
                    (!optionMatch && !answerMatch && currentQuestion?.options.length === 0 === false);
                if (isNewQuestion && !optionMatch) {
                    flush();
                    currentQuestion = {
                        id: (0, crypto_1.randomUUID)(),
                        text: line.replace(QUESTION_PREFIX, '').trim(),
                        type: 'single_choice',
                        timeLimit: 30,
                        points: 100,
                        order,
                        options: [],
                    };
                }
            }
        }
        flush();
        return { questions, warnings: rawWarnings };
    }
};
exports.QuizService = QuizService;
exports.QuizService = QuizService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(quiz_schema_1.Quiz.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], QuizService);
//# sourceMappingURL=quiz.service.js.map