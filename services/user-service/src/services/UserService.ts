import { injectable, inject } from 'tsyringe';
import { BaseService } from '@londa-rides/shared';
import { ILogger, TYPES, ValidationException, UserAlreadyExistsException, NotFoundException, Validator } from '@londa-rides/shared';
import { User } from '../models/User';
import { IUserRepository } from '../repositories/IUserRepository';
import { IUserService } from './IUserService';
import { CreateUserDTO, UpdateUserDTO } from '@londa-rides/shared';

/**
 * User service - business logic layer
 */
@injectable()
export class UserService extends BaseService implements IUserService {
  constructor(
    @inject(TYPES.UserRepository) private readonly userRepository: IUserRepository,
    @inject(TYPES.Logger) logger: ILogger
  ) {
    super(logger);
  }

  public async createUser(data: CreateUserDTO): Promise<User> {
    this.logOperation('createUser', { phoneNumber: data.phoneNumber });

    try {
      // Validate input
      this.validateCreateUserData(data);

      // Check if user already exists
      const existingUser = await this.userRepository.findByPhoneNumber(data.phoneNumber);
      if (existingUser) {
        throw new UserAlreadyExistsException(data.phoneNumber, 'phoneNumber');
      }

      // Check email if provided
      if (data.email) {
        const existingEmail = await this.userRepository.findByEmail(data.email);
        if (existingEmail) {
          throw new UserAlreadyExistsException(data.email, 'email');
        }
      }

      // Create domain model
      const user = User.create({
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        userType: data.userType,
        notificationToken: undefined
      });

      // Persist
      await this.userRepository.save(user);

      this.logSuccess('createUser', { userId: user.getId() });
      return user;
    } catch (error) {
      this.handleError('createUser', error);
    }
  }

  public async getUserById(id: string): Promise<User> {
    this.logOperation('getUserById', { userId: id });

    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new NotFoundException('User', id);
      }

      this.logSuccess('getUserById', { userId: id });
      return user;
    } catch (error) {
      this.handleError('getUserById', error);
    }
  }

  public async getUserByPhoneNumber(phoneNumber: string): Promise<User> {
    this.logOperation('getUserByPhoneNumber', { phoneNumber });

    try {
      const user = await this.userRepository.findByPhoneNumber(phoneNumber);
      if (!user) {
        throw new NotFoundException('User', phoneNumber);
      }

      this.logSuccess('getUserByPhoneNumber', { phoneNumber });
      return user;
    } catch (error) {
      this.handleError('getUserByPhoneNumber', error);
    }
  }

  public async updateUser(id: string, data: UpdateUserDTO): Promise<User> {
    this.logOperation('updateUser', { userId: id });

    try {
      const user = await this.getUserById(id);

      // Check email uniqueness if provided
      if (data.email && data.email !== user.getEmail()) {
        const existingEmail = await this.userRepository.findByEmail(data.email);
        if (existingEmail && existingEmail.getId() !== id) {
          throw new UserAlreadyExistsException(data.email, 'email');
        }
      }

      // Update profile
      user.updateProfile(data);

      // Persist
      await this.userRepository.save(user);

      this.logSuccess('updateUser', { userId: id });
      return user;
    } catch (error) {
      this.handleError('updateUser', error);
    }
  }

  public async deleteUser(id: string): Promise<void> {
    this.logOperation('deleteUser', { userId: id });

    try {
      const user = await this.getUserById(id);
      await this.userRepository.delete(id);

      this.logSuccess('deleteUser', { userId: id });
    } catch (error) {
      this.handleError('deleteUser', error);
    }
  }

  public async getAllUsers(limit: number = 10, offset: number = 0): Promise<User[]> {
    this.logOperation('getAllUsers', { limit, offset });

    try {
      const users = await this.userRepository.findAll(limit, offset);
      this.logSuccess('getAllUsers', { count: users.length });
      return users;
    } catch (error) {
      this.handleError('getAllUsers', error);
    }
  }

  private validateCreateUserData(data: CreateUserDTO): void {
    if (!data.phoneNumber) {
      throw new ValidationException('Phone number is required');
    }

    if (!Validator.isValidPhoneNumber(data.phoneNumber)) {
      throw new ValidationException('Invalid phone number format');
    }

    if (data.email && !Validator.isValidEmail(data.email)) {
      throw new ValidationException('Invalid email format');
    }
  }
}

