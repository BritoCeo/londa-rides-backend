import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { BaseController } from '@londa-rides/shared';
import { ILogger, TYPES } from '@londa-rides/shared';
import { DriverService } from '../services/DriverService';

@injectable()
export class DriverController extends BaseController {
  constructor(
    @inject(TYPES.DriverService) private readonly driverService: DriverService,
    @inject(TYPES.Logger) logger: ILogger
  ) {
    super(logger);
  }

  public createDriver = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const driver = await this.driverService.createDriver(req.body);
    this.sendSuccess(res, driver, 'Driver created', 201);
  });

  public getDriverById = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const driver = await this.driverService.getDriverById(req.params.id);
    this.sendSuccess(res, driver);
  });
}

