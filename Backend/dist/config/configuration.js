"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    env: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3001),
    mongoUri: process.env.MONGO_URI ?? 'mongodb+srv://tinbao567_db_user:rMGuH69lL6oWc9iB@cluster0.1ynenbi.mongodb.net/',
});
//# sourceMappingURL=configuration.js.map