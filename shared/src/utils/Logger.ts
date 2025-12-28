/**
 * Logger interface
 */
export interface ILogger {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
}

/**
 * Simple console logger implementation
 * Can be replaced with Winston, Pino, etc.
 */
export class ConsoleLogger implements ILogger {
  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaStr}`;
  }

  public debug(message: string, meta?: any): void {
    console.debug(this.formatMessage('DEBUG', message, meta));
  }

  public info(message: string, meta?: any): void {
    console.info(this.formatMessage('INFO', message, meta));
  }

  public warn(message: string, meta?: any): void {
    console.warn(this.formatMessage('WARN', message, meta));
  }

  public error(message: string, meta?: any): void {
    console.error(this.formatMessage('ERROR', message, meta));
  }
}

// Export StructuredLogger as default logger
export { StructuredLogger } from './StructuredLogger';

