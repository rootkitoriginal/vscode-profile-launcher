/**
 * Logger utility for consistent logging across the application
 */

export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR'
}

export class Logger {
    private static instance: Logger;
    private debugMode: boolean = false;

    private constructor() {
        // Check if debug mode is enabled
        this.debugMode = process.env.DEBUG_MODE === 'true';
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    private formatMessage(level: LogLevel, message: string, data?: any): string {
        const timestamp = new Date().toISOString();
        const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
        return `[${timestamp}] [${level}] ${message}${dataStr}`;
    }

    public debug(message: string, data?: any): void {
        if (this.debugMode) {
            console.debug(this.formatMessage(LogLevel.DEBUG, message, data));
        }
    }

    public info(message: string, data?: any): void {
        console.info(this.formatMessage(LogLevel.INFO, message, data));
    }

    public warn(message: string, data?: any): void {
        console.warn(this.formatMessage(LogLevel.WARN, message, data));
    }

    public error(message: string, error?: Error | any): void {
        const errorData = error instanceof Error 
            ? { message: error.message, stack: error.stack }
            : error;
        console.error(this.formatMessage(LogLevel.ERROR, message, errorData));
    }
}

// Export default instance
export default Logger.getInstance();
