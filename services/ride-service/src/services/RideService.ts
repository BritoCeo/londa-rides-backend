import { injectable, inject } from 'tsyringe';
import { BaseService } from '@londa-rides/shared';
import { ILogger, TYPES, NotFoundException } from '@londa-rides/shared';
import { Ride } from '../models/Ride';
import { IRideRepository } from '../repositories/IRideRepository';

export interface IRideService {
  createRide(data: any): Promise<Ride>;
  getRideById(id: string): Promise<Ride>;
  acceptRide(rideId: string, driverId: string): Promise<Ride>;
  startRide(rideId: string): Promise<Ride>;
  completeRide(rideId: string): Promise<Ride>;
}

@injectable()
export class RideService extends BaseService implements IRideService {
  constructor(
    @inject(TYPES.RideRepository) private readonly rideRepository: IRideRepository,
    @inject(TYPES.Logger) logger: ILogger
  ) {
    super(logger);
  }

  public async createRide(data: any): Promise<Ride> {
    const ride = Ride.create(data);
    await this.rideRepository.save(ride);
    return ride;
  }

  public async getRideById(id: string): Promise<Ride> {
    const ride = await this.rideRepository.findById(id);
    if (!ride) throw new NotFoundException('Ride', id);
    return ride;
  }

  public async acceptRide(rideId: string, driverId: string): Promise<Ride> {
    const ride = await this.getRideById(rideId);
    ride.accept(driverId);
    await this.rideRepository.save(ride);
    return ride;
  }

  public async startRide(rideId: string): Promise<Ride> {
    const ride = await this.getRideById(rideId);
    ride.start();
    await this.rideRepository.save(ride);
    return ride;
  }

  public async completeRide(rideId: string): Promise<Ride> {
    const ride = await this.getRideById(rideId);
    ride.complete();
    await this.rideRepository.save(ride);
    return ride;
  }
}

