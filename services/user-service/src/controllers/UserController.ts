import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { BaseController } from '@londa-rides/shared';
import { ILogger, TYPES, NotFoundException } from '@londa-rides/shared';
import { CreateUserDTOFactory, UpdateUserDTOFactory, UserResponseDTOFactory } from '@londa-rides/shared';
import { IUserService } from '../services/IUserService';

/**
 * User controller - HTTP request handlers (MVC)
 */
@injectable()
export class UserController extends BaseController {
  constructor(
    @inject(TYPES.UserService) private readonly userService: IUserService,
    @inject(TYPES.Logger) logger: ILogger
  ) {
    super(logger);
  }

  public createUser = this.asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const createUserDTO = CreateUserDTOFactory.fromRequest(req.body);
      const user = await this.userService.createUser(createUserDTO);
      
      const response = UserResponseDTOFactory.fromDomain(user);
      this.sendSuccess(res, response, 'User created successfully', 201);
    } catch (error) {
      next(error);
    }
  });

  public getUserById = this.asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);
      
      const response = UserResponseDTOFactory.fromDomain(user);
      this.sendSuccess(res, response);
    } catch (error) {
      next(error);
    }
  });

  public getUserByPhoneNumber = this.asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Support both path parameter and query parameter
      const phoneNumber = req.params.phoneNumber || req.query.phoneNumber;
      
      if (!phoneNumber || typeof phoneNumber !== 'string') {
        throw new NotFoundException('User');
      }

      const user = await this.userService.getUserByPhoneNumber(phoneNumber);
      const response = UserResponseDTOFactory.fromDomain(user);
      this.sendSuccess(res, response);
    } catch (error) {
      next(error);
    }
  });

  public updateUser = this.asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updateUserDTO = UpdateUserDTOFactory.fromRequest(req.body);
      const user = await this.userService.updateUser(id, updateUserDTO);
      
      const response = UserResponseDTOFactory.fromDomain(user);
      this.sendSuccess(res, response, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  });

  public deleteUser = this.asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.userService.deleteUser(id);
      
      this.sendSuccess(res, null, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  });

  public getAllUsers = this.asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const users = await this.userService.getAllUsers(limit, offset);
      const responses = users.map(user => UserResponseDTOFactory.fromDomain(user));
      
      this.sendSuccess(res, {
        users: responses,
        count: responses.length,
        limit,
        offset
      });
    } catch (error) {
      next(error);
    }
  });
}

