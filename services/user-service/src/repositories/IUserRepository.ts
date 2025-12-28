import { User } from '../models/User';

/**
 * User repository interface
 */
export interface IUserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByPhoneNumber(phoneNumber: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  delete(id: string): Promise<void>;
  findAll(limit?: number, offset?: number): Promise<User[]>;
}

