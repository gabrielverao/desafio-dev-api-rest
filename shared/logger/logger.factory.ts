import { LoggerService } from './logger.service';

export const createLogger = (context: string): LoggerService => {
    return new LoggerService(context);
};
