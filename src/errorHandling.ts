// error-handler.ts
import { Logger } from './logger';

const logger = new Logger('ErrorHandler');

export function handlePromiseRejection(reason: unknown): void {
  const errorMessage = `Unhandled promise rejection: Reason: ${(reason as Error).stack || reason}`;
  logger.error(errorMessage);
}

export function handleApiError(error: any): void {
  // Handle API-specific errors here
  logger.error(`API Error: ${(error as Error).stack || error}`);
}

process.on('unhandledRejection', (reason, promise) => {
    const errorMessage = `Unhandled promise rejection: Reason: ${(reason as Error).stack || reason}`;
    console.log(errorMessage);
    // Here, you could also log this error message to a file or send it to an external service
});

// ERROR HANDLING
client.on('error', (err) => {
    logger.error(`There was an error logging into Steam: ${err.message}`);
});
