"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const core_1 = require("@nestjs/core");
const mongoose_1 = require("@nestjs/mongoose");
const app_module_1 = require("../app.module");
const quiz_schema_1 = require("../modules/quiz/quiz.schema");
function parseTsv(content) {
    const lines = content
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
    return lines.map((line, index) => {
        const [question, optionA, optionB, optionC, optionD, correctIndex, timeLimit, points,] = line.split('\t');
        const options = [optionA, optionB, optionC, optionD].map((text, idx) => ({
            id: String.fromCharCode(97 + idx),
            text,
            isCorrect: String(idx + 1) === correctIndex,
        }));
        return {
            id: `q${index + 1}`,
            text: question,
            type: 'single_choice',
            timeLimit: Number(timeLimit ?? 20),
            points: Number(points ?? 100),
            order: index + 1,
            options,
        };
    });
}
async function bootstrap() {
    const filePath = process.argv[2];
    const title = process.argv[3] ?? 'Imported Quiz';
    if (!filePath) {
        throw new Error('Usage: npm run import:quiz -- <path-to-tsv> [title]');
    }
    const content = (0, node_fs_1.readFileSync)(filePath, 'utf8');
    const questions = parseTsv(content);
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const quizModel = app.get((0, mongoose_1.getModelToken)(quiz_schema_1.Quiz.name));
    const created = await quizModel.create({
        title,
        description: `Imported from ${filePath}`,
        visibility: 'private',
        questions,
    });
    console.log('Imported quiz:', created.id);
    await app.close();
}
bootstrap();
//# sourceMappingURL=import-quiz.js.map