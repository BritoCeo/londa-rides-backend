import pino, { Logger as PinoLogger, LoggerOptions } from 'pino';
import { ILogger } from './Logger';

/**
 * Structured logger implementation using Pino
 */
export class StructuredLogger implements ILogger {
  private logger: PinoLogger;

  constructor(options?: LoggerOptions) {
    const defaultOptions: LoggerOptions = {
      level: process.env.LOG_LEVEL || 'info',
      ...(process.env.NODE_ENV === 'development' && {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname'
          }
        }
      })
    };

    this.logger = pino({ ...defaultOptions, ...options });
  }

  public debug(message: string, meta?: any): void {
    this.logger.debug(meta, message);
  }

  public info(message: string, meta?: any): void {
    this.logger.info(meta, message);
  }

  public warn(message: string, meta?: any): void {
    this.logger.warn(meta, message);
  }

  public error(message: string, meta?: any): void {
    this.logger.error(meta, message);
  }

  /**
   * Get the underlying Pino logger instance
   */
  public getPinoLogger(): PinoLogger {
    return this.logger;
  }

  /**
   * Create a child logger with additional context
   */
  public child(bindings: Record<string, any>): StructuredLogger {
    const childLogger = new StructuredLogger();
    childLogger.logger = this.logger.child(bindings);
    return childLogger;
  }
}

