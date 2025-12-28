import axios from 'axios';
import { ILogger } from './Logger';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services?: Record<string, 'up' | 'down'>;
  uptime: number;
}

export class HealthChecker {
  constructor(private readonly logger: ILogger) {}

  public checkHealth(): HealthStatus {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }

  public async checkServiceHealth(serviceUrl: string): Promise<'up' | 'down'> {
    try {
      const response = await axios.get(`${serviceUrl}/health`, { 
        timeout: 5000 
      });
      return response.status === 200 ? 'up' : 'down';
    } catch (error) {
      this.logger.error('Service health check failed', { serviceUrl, error });
      return 'down';
    }
  }
}

