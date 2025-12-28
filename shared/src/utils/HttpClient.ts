import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ILogger } from './Logger';

/**
 * HTTP client with circuit breaker pattern
 */
export class HttpClient {
  private client: AxiosInstance;
  private circuitBreakerState: 'closed' | 'open' | 'half-open' = 'closed';
  private failureCount: number = 0;
  private readonly failureThreshold: number = 5;
  private readonly timeout: number = 10000;

  constructor(
    private readonly baseUrl: string,
    private readonly logger: ILogger
  ) {
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: this.timeout
    });
  }

  public async request<T>(config: AxiosRequestConfig): Promise<T> {
    if (this.circuitBreakerState === 'open') {
      throw new Error('Circuit breaker is open');
    }

    try {
      const response = await this.client.request<T>(config);
      this.onSuccess();
      return response.data;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    if (this.circuitBreakerState === 'half-open') {
      this.circuitBreakerState = 'closed';
      this.logger.info('Circuit breaker closed', { baseUrl: this.baseUrl });
    }
  }

  private onFailure(): void {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.circuitBreakerState = 'open';
      this.logger.warn('Circuit breaker opened', { baseUrl: this.baseUrl, failures: this.failureCount });
      
      // Try to recover after 30 seconds
      setTimeout(() => {
        this.circuitBreakerState = 'half-open';
        this.logger.info('Circuit breaker half-open', { baseUrl: this.baseUrl });
      }, 30000);
    }
  }
}

