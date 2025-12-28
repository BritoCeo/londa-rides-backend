import morgan from 'morgan';
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

// Custom morgan token for request ID
morgan.token('reqId', (req: Request) => {
  return (req as any).requestId || 'unknown';
});

// Custom morgan token for response time
morgan.token('responseTime', (req: Request, res: Response) => {
  return (res as any).responseTime || '0';
});

// Custom morgan token for user ID
morgan.token('userId', (req: Request) => {
  return (req as any).user?.id || 'anonymous';
});

// Custom morgan token for driver ID
morgan.token('driverId', (req: Request) => {
  return (req as any).driver?.id || 'anonymous';
});

// Custom morgan format
const morganFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms - ReqID: :reqId - UserID: :userId - DriverID: :driverId';

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create write streams for different log types
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

const errorLogStream = fs.createWriteStream(
  path.join(logsDir, 'error.log'),
  { flags: 'a' }
);

// Morgan middleware for access logging
export const accessLogger = morgan(morganFormat, {
  stream: accessLogStream,
  skip: (req: Request, res: Response) => {
    // Skip logging for health checks and static files
    return req.url === '/health' || req.url.startsWith('/static');
  }
});

// Morgan middleware for console logging (development)
export const consoleLogger = morgan(morganFormat, {
  skip: (req: Request, res: Response) => {
    // Only log in development
    return process.env.NODE_ENV === 'production';
  }
});

// Request ID middleware
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  (req as any).requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

// Response time middleware
export const responseTimeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    (res as any).responseTime = responseTime;
  });
  
  next();
};

// Custom logging middleware for API calls
export const apiLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestId = (req as any).requestId;
  
  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - RequestID: ${requestId}`);
  
  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(body: any) {
    const responseTime = Date.now() - startTime;
    const logData = {
      timestamp: new Date().toISOString(),
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: (req as any).user?.id || 'anonymous',
      driverId: (req as any).driver?.id || 'anonymous'
    };
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', logData);
    }
    
    // Log to file
    const logEntry = JSON.stringify(logData) + '\n';
    accessLogStream.write(logEntry);
    
    return originalJson.call(this, body);
  };
  
  next();
};

// Error logging middleware
export const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction) => {
  const requestId = (req as any).requestId;
  const errorLog = {
    timestamp: new Date().toISOString(),
    requestId,
    method: req.method,
    url: req.url,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: (req as any).user?.id || 'anonymous',
    driverId: (req as any).driver?.id || 'anonymous'
  };
  
  // Log to console
  console.error('Error occurred:', errorLog);
  
  // Log to file
  const logEntry = JSON.stringify(errorLog) + '\n';
  errorLogStream.write(logEntry);
  
  next(error);
};

// Performance monitoring middleware
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime.bigint();
  
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    
    // Log slow requests (> 1 second)
    if (duration > 1000) {
      console.warn(`Slow request detected: ${req.method} ${req.url} took ${duration.toFixed(2)}ms`);
    }
    
    // Log performance metrics
    const perfLog = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      duration: `${duration.toFixed(2)}ms`,
      statusCode: res.statusCode,
      requestId: (req as any).requestId
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance:', perfLog);
    }
  });
  
  next();
};

// Database query logging middleware
export const dbQueryLogger = (query: string, params?: any[]) => {
  const logData = {
    timestamp: new Date().toISOString(),
    type: 'database_query',
    query: query.replace(/\s+/g, ' ').trim(),
    params: params || [],
    duration: 'unknown'
  };
  
  if (process.env.NODE_ENV === 'development') {
    console.log('DB Query:', logData);
  }
  
  return logData;
};

// Clean up old log files (run this periodically)
export const cleanupLogs = (daysToKeep: number = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  fs.readdir(logsDir, (err, files) => {
    if (err) return;
    
    files.forEach(file => {
      const filePath = path.join(logsDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        
        if (stats.mtime < cutoffDate) {
          fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting log file:', err);
            else console.log(`Deleted old log file: ${file}`);
          });
        }
      });
    });
  });
};
