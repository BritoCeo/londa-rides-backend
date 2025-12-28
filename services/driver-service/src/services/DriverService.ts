import { injectable, inject } from 'tsyringe';
import { BaseService } from '@londa-rides/shared';
import { ILogger, TYPES, ValidationException, DriverAlreadyExistsException, NotFoundException, Validator, DriverStatus } from '@londa-rides/shared';
import { Driver } from '../models/Driver';
import { IDriverRepository } from '../repositories/IDriverRepository';

export interface IDriverService {
  createDriver(data: any): Promise<Driver>;
  getDriverById(id: string): Promise<Driver>;
  updateDriverStatus(id: string, status: DriverStatus): Promise<Driver>;
}

@injectable()
export class DriverService extends BaseService implements IDriverService {
  constructor(
    @inject(TYPES.DriverRepository) private readonly driverRepository: IDriverRepository,
    @inject(TYPES.Logger) logger: ILogger
  ) {
    super(logger);
  }

  public async createDriver(data: any): Promise<Driver> {
    this.logOperation('createDriver', { phoneNumber: data.phoneNumber });
    this.validateDriverData(data);
    
    const existing = await this.driverRepository.findByPhoneNumber(data.phoneNumber);
    if (existing) throw new DriverAlreadyExistsException(data.phoneNumber);
    
    const driver = Driver.create(data);
    await this.driverRepository.save(driver);
    this.logSuccess('createDriver', { driverId: driver.getId() });
    return driver;
  }

  public async getDriverById(id: string): Promise<Driver> {
    const driver = await this.driverRepository.findById(id);
    if (!driver) throw new NotFoundException('Driver', id);
    return driver;
  }

  public async updateDriverStatus(id: string, status: DriverStatus): Promise<Driver> {
    const driver = await this.getDriverById(id);
    driver.updateStatus(status);
    await this.driverRepository.save(driver);
    return driver;
  }

  private validateDriverData(data: any): void {
    if (!data.phoneNumber || !Validator.isValidPhoneNumber(data.phoneNumber)) {
      throw new ValidationException('Invalid phone number');
    }
    if (data.email && !Validator.isValidEmail(data.email)) {
      throw new ValidationException('Invalid email');
    }
  }
}

