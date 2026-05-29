type AppConfig = {
  env: string;
  port: number;
  mongoUri: string;
};

export default (): AppConfig => ({
  env: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3001),
  mongoUri: process.env.MONGO_URI ?? 'mongodb+srv://tinbao567_db_user:rMGuH69lL6oWc9iB@cluster0.1ynenbi.mongodb.net/',
});
