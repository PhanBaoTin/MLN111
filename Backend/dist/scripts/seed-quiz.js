"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const mongoose_1 = require("@nestjs/mongoose");
const app_module_1 = require("../app.module");
const quiz_schema_1 = require("../modules/quiz/quiz.schema");
const sampleQuiz = {
    title: 'Reveal Race Sample',
    description: 'Sample quiz seeded for testing',
    visibility: 'public',
    questions: [
        {
            id: 'q1',
            text: 'Which planet is known as the Morning Star?',
            type: 'single_choice',
            timeLimit: 20,
            points: 100,
            order: 1,
            options: [
                { id: 'a', text: 'Venus', isCorrect: true },
                { id: 'b', text: 'Mars', isCorrect: false },
                { id: 'c', text: 'Jupiter', isCorrect: false },
                { id: 'd', text: 'Saturn', isCorrect: false },
            ],
        },
        {
            id: 'q2',
            text: 'How many continents are there?',
            type: 'single_choice',
            timeLimit: 15,
            points: 100,
            order: 2,
            options: [
                { id: 'a', text: '5', isCorrect: false },
                { id: 'b', text: '6', isCorrect: false },
                { id: 'c', text: '7', isCorrect: true },
                { id: 'd', text: '8', isCorrect: false },
            ],
        },
    ],
};
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const quizModel = app.get((0, mongoose_1.getModelToken)(quiz_schema_1.Quiz.name));
    await quizModel.deleteMany({ title: sampleQuiz.title }).exec();
    const created = await quizModel.create(sampleQuiz);
    console.log('Seeded quiz:', created.id);
    await app.close();
}
bootstrap();
//# sourceMappingURL=seed-quiz.js.map