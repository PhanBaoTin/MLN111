import { Logger } from '@nestjs/common';
export declare class DatabaseLogger {
    logger: Logger;
    logConnectionStart(uri: string): void;
    logConnectionSuccess(): void;
    logConnectionError(error: any): void;
    logCollectionCreated(collectionName: string): void;
    logDatabaseInfo(dbName: string, collections: number): void;
    logConnectionRetry(attempt: number, maxAttempts: number): void;
    logTimeout(): void;
    logDisconnected(): void;
    logReconnected(): void;
    private maskSensitiveInfo;
    logQueryPerformance(query: string, duration: number): void;
    logConnectionOptions(options: any): void;
}
