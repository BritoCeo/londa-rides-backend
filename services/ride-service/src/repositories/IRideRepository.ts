import { Ride } from '../models/Ride';

export interface IRideRepository {
  save(ride: Ride): Promise<void>;
  findById(id: string): Promise<Ride | null>;
  delete(id: string): Promise<void>;
}

