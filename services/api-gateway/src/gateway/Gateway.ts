import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import axios, { AxiosInstance } from 'axios';
import { ILogger } from '@londa-rides/shared';

export interface ServiceConfig {
  name: string;
  baseUrl: string;
  timeout?: number;
}

export class ApiGateway {
  private app: Application;
  private services: Map<string, ServiceConfig> = new Map();
  private httpClient: AxiosInstance;

  constructor(private readonly logger: ILogger) {
    this.app = express();
    this.httpClient = axios.create();
    this.setupMiddleware();
    this.registerServices();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use((req, res, next) => {
      this.logger.info('Gateway request', { method: req.method, path: req.path });
      next();
    });
  }

  private registerServices(): void {
    this.services.set('user', {
      name: 'user-service',
      baseUrl: process.env.USER_SERVICE_URL || 'http://localhost:8002',
      timeout: 30000 // 30 seconds
    });
    this.services.set('driver', {
      name: 'driver-service',
      baseUrl: process.env.DRIVER_SERVICE_URL || 'http://localhost:8003',
      timeout: 30000
    });
    this.services.set('auth', {
      name: 'auth-service',
      baseUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:8001',
      timeout: 30000
    });
    this.services.set('ride', {
      name: 'ride-service',
      baseUrl: process.env.RIDE_SERVICE_URL || 'http://localhost:8004',
      timeout: 30000
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Proxy routes
    this.app.use('/api/v1/users', this.proxyToService('user'));
    this.app.use('/api/v1/drivers', this.proxyToService('driver'));
    this.app.use('/api/v1/auth', this.proxyToService('auth'));
    this.app.use('/api/v1/rides', this.proxyToService('ride'));
  }

  private proxyToService(serviceName: string) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const service = this.services.get(serviceName);
      if (!service) {
        res.status(503).json({ error: 'Service unavailable' });
        return;
      }

      // Handle client disconnection
      req.on('close', () => {
        if (res.headersSent) {
          return;
        }
        this.logger.warn('Client disconnected', { service: serviceName, path: req.path });
      });

      try {
        // Build the target URL
        // req.baseUrl is the matched route prefix (e.g., '/api/v1/users')
        // req.path is the remaining path after the matched prefix (e.g., '/' or '/123')
        // We combine them to get the full path
        let targetPath = (req.baseUrl || '') + (req.path || '/');
        // Remove trailing slash if it's not the root path
        if (targetPath !== '/' && targetPath.endsWith('/')) {
          targetPath = targetPath.slice(0, -1);
        }
        
        // Add query string if present
        const queryString = Object.keys(req.query).length > 0 
          ? '?' + new URLSearchParams(req.query as any).toString() 
          : '';
        
        const url = `${service.baseUrl}${targetPath}${queryString}`;
        
        // Prepare headers - remove host and connection headers, add content-type if body exists
        const headers: any = {};
        Object.keys(req.headers).forEach(key => {
          const lowerKey = key.toLowerCase();
          // Skip headers that shouldn't be forwarded
          if (lowerKey !== 'host' && lowerKey !== 'connection' && lowerKey !== 'content-length') {
            headers[key] = req.headers[key];
          }
        });

        // Set content-type for JSON if body exists
        if (req.body && Object.keys(req.body).length > 0) {
          headers['content-type'] = 'application/json';
        }

        this.logger.info('Proxying request', {
          service: serviceName,
          method: req.method,
          originalPath: req.originalUrl,
          baseUrl: req.baseUrl,
          path: req.path,
          targetUrl: url,
          hasBody: !!req.body
        });

        const response = await this.httpClient.request({
          method: req.method as any,
          url,
          data: req.body && Object.keys(req.body).length > 0 ? req.body : undefined,
          params: Object.keys(req.query).length > 0 ? req.query : undefined,
          headers,
          timeout: service.timeout || 30000, // Increased timeout to 30 seconds
          validateStatus: () => true // Don't throw on any status code
        });

        // Forward response
        res.status(response.status);
        
        // Forward response headers (except those that shouldn't be forwarded)
        Object.keys(response.headers).forEach(key => {
          const lowerKey = key.toLowerCase();
          if (lowerKey !== 'connection' && lowerKey !== 'transfer-encoding' && lowerKey !== 'content-encoding') {
            res.setHeader(key, response.headers[key] as string);
          }
        });

        res.json(response.data);
      } catch (error: any) {
        // Check if response was already sent
        if (res.headersSent) {
          this.logger.warn('Response already sent, cannot send error', { service: serviceName });
          return;
        }

        // Handle specific error types
        if (error.code === 'ECONNREFUSED') {
          this.logger.error('Service connection refused', { service: serviceName, baseUrl: service.baseUrl });
          res.status(503).json({
            success: false,
            error: 'Service unavailable',
            message: `Cannot connect to ${service.name}`,
            code: 'SERVICE_UNAVAILABLE'
          });
        } else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
          this.logger.error('Service timeout', { service: serviceName });
          res.status(504).json({
            success: false,
            error: 'Gateway timeout',
            message: `Service ${service.name} did not respond in time`,
            code: 'GATEWAY_TIMEOUT'
          });
        } else if (error.response) {
          // Service responded with an error
          this.logger.error('Service error response', {
            service: serviceName,
            status: error.response.status,
            data: error.response.data
          });
          res.status(error.response.status).json(error.response.data);
        } else {
          // Unknown error
          this.logger.error('Gateway proxy error', {
            service: serviceName,
            error: error.message,
            stack: error.stack,
            code: error.code
          });
          res.status(500).json({
            success: false,
            error: 'Internal gateway error',
            message: error.message || 'An unexpected error occurred',
            code: 'GATEWAY_ERROR'
          });
        }
      }
    };
  }

  public getApp(): Application {
    return this.app;
  }
}

