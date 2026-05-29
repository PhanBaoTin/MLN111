type AppConfig = {
  env: string;
  port: number;
  mongoUri: string;
};

export default (): AppConfig => ({
  env: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3001),
  mongoUri: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/reveal_quiz_race',
});
