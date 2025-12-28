import { injectable, inject } from 'tsyringe';
import { BaseService } from '@londa-rides/shared';
import { ILogger, TYPES, UnauthorizedException, ValidationException } from '@londa-rides/shared';
import bcrypt from 'bcryptjs';
import { JwtService, TokenPayload } from './JwtService';

export interface LoginCredentials {
  phoneNumber: string;
  password: string;
  type: 'user' | 'driver';
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: any;
}

@injectable()
export class AuthService extends BaseService {
  constructor(
    @inject(TYPES.Logger) logger: ILogger,
    private readonly jwtService: JwtService
  ) {
    super(logger);
  }

  public async login(credentials: LoginCredentials): Promise<AuthResult> {
    this.logOperation('login', { phoneNumber: credentials.phoneNumber });
    
    // Validate credentials
    if (!credentials.phoneNumber || !credentials.password) {
      throw new ValidationException('Phone number and password are required');
    }

    // Get user/driver (would be injected from respective services)
    // For now, placeholder
    const user = { id: '1', phoneNumber: credentials.phoneNumber };

    // Verify password (placeholder - would check against stored hash)
    // const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
    // if (!isValid) throw new UnauthorizedException('Invalid credentials');

    // Generate tokens
    const payload: TokenPayload = {
      id: user.id,
      type: credentials.type
    };

    const accessToken = this.jwtService.generateAccessToken(payload);
    const refreshToken = this.jwtService.generateRefreshToken(payload);

    this.logSuccess('login', { userId: user.id });
    return { accessToken, refreshToken, user };
  }

  public async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const payload = this.jwtService.verifyRefreshToken(refreshToken);
    const accessToken = this.jwtService.generateAccessToken(payload);
    return { accessToken };
  }
}

