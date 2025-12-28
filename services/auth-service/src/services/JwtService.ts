import { injectable } from 'tsyringe';
import jwt from 'jsonwebtoken';
import { ILogger } from '@londa-rides/shared';

export interface TokenPayload {
  id: string;
  type: 'user' | 'driver';
  email?: string;
}

@injectable()
export class JwtService {
  private readonly secret: string;
  private readonly refreshSecret: string;

  constructor(private readonly logger: ILogger) {
    this.secret = process.env.JWT_SECRET || 'fallback-secret';
    this.refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
  }

  public generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: '15m' });
  }

  public generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.refreshSecret, { expiresIn: '7d' });
  }

  public verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.secret) as TokenPayload;
    } catch (error) {
      this.logger.error('Token verification failed', { error });
      throw new Error('Invalid token');
    }
  }

  public verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.refreshSecret) as TokenPayload;
    } catch (error) {
      this.logger.error('Refresh token verification failed', { error });
      throw new Error('Invalid refresh token');
    }
  }
}

