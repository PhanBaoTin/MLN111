type AppConfig = {
  env: string;
  port: number;
  mongoUri: string;
};

export default (): AppConfig => ({
  env: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3001),
  mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/reveal-quiz-race',
});
