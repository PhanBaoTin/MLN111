"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    env: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3001),
    mongoUri: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/reveal_quiz_race',
});
//# sourceMappingURL=configuration.js.map