import { User } from '../models/User';
import { CreateUserDTO, UpdateUserDTO } from '@londa-rides/shared';

/**
 * User service interface
 */
export interface IUserService {
  createUser(data: CreateUserDTO): Promise<User>;
  getUserById(id: string): Promise<User>;
  getUserByPhoneNumber(phoneNumber: string): Promise<User>;
  updateUser(id: string, data: UpdateUserDTO): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getAllUsers(limit?: number, offset?: number): Promise<User[]>;
}

