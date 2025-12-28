/**
 * Logger utility for consistent logging across the socket server
 */

const config = require('./config');

class Logger {
  constructor(context = 'SocketServer') {
    this.context = context;
    this.logLevel = this.getLogLevel(config.LOG_LEVEL);
  }

  getLogLevel(level) {
    const levels = {
      'error': 0,
      'warn': 1,
      'info': 2,
      'debug': 3
    };
    return levels[level] || 2;
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.context}]`;
    
    if (data) {
      return `${prefix} ${message} ${JSON.stringify(data)}`;
    }
    return `${prefix} ${message}`;
  }

  error(message, data = null) {
    if (this.logLevel >= 0) {
      console.error(this.formatMessage('error', message, data));
    }
  }

  warn(message, data = null) {
    if (this.logLevel >= 1) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  info(message, data = null) {
    if (this.logLevel >= 2) {
      console.log(this.formatMessage('info', message, data));
    }
  }

  debug(message, data = null) {
    if (this.logLevel >= 3) {
      console.log(this.formatMessage('debug', message, data));
    }
  }

  // Specialized logging methods
  connection(clientId, action, data = null) {
    this.info(`Connection ${action}: ${clientId}`, data);
  }

  websocket(event, clientId, data = null) {
    this.debug(`WebSocket ${event}: ${clientId}`, data);
  }

  http(method, url, status, duration = null) {
    const message = `${method} ${url} - ${status}`;
    const data = duration ? { duration: `${duration}ms` } : null;
    this.info(message, data);
  }

  error(error, context = null) {
    if (this.logLevel >= 0) {
      const message = context ? `${context}: ${error.message}` : error.message;
      console.error(this.formatMessage('error', message, {
        stack: error.stack,
        code: error.code,
        ...error
      }));
    }
  }
}

module.exports = Logger;
