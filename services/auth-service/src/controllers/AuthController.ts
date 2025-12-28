import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { BaseController } from '@londa-rides/shared';
import { ILogger, TYPES } from '@londa-rides/shared';
import { AuthService } from '../services/AuthService';

@injectable()
export class AuthController extends BaseController {
  constructor(
    @inject(TYPES.AuthService) private readonly authService: AuthService,
    @inject(TYPES.Logger) logger: ILogger
  ) {
    super(logger);
  }

  public login = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.login(req.body);
    this.sendSuccess(res, result, 'Login successful');
  });

  public refresh = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    const result = await this.authService.refreshToken(refreshToken);
    this.sendSuccess(res, result, 'Token refreshed');
  });
}

