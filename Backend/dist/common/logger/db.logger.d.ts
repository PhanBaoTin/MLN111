export declare class DbLogger {
    private static logger;
    static startTimer(operation: string): {
        operation: string;
        startTime: number;
    };
    static endTimer(timer: {
        operation: string;
        startTime: number;
    }, message?: string): void;
    static logFind(collection: string, query: any, resultCount: number): void;
    static logInsert(collection: string, id: string): void;
    static logUpdate(collection: string, id: string): void;
    static logDelete(collection: string, id: string): void;
    static logError(collection: string, operation: string, error: any): void;
    static logConnectionStatus(status: 'connected' | 'disconnected' | 'error', details?: string): void;
}
