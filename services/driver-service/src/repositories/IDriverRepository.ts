import { Driver } from '../models/Driver';

export interface IDriverRepository {
  save(driver: Driver): Promise<void>;
  findById(id: string): Promise<Driver | null>;
  findByPhoneNumber(phoneNumber: string): Promise<Driver | null>;
  findByEmail(email: string): Promise<Driver | null>;
  delete(id: string): Promise<void>;
}

