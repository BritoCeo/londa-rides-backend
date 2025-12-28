import 'reflect-metadata';
import { Router } from 'express';
import { Container } from '@londa-rides/shared';
import { TYPES } from '@londa-rides/shared';
import { UserController } from '../controllers/UserController';

/**
 * Create user routes with resolved controller
 * This function should be called after dependencies are set up
 */
export function createUserRoutes(): Router {
  const router = Router();
  
  // Resolve controller from DI container
  const userController = Container.resolve<UserController>(TYPES.UserController);

  // User routes
  // Note: Order matters - specific routes before parameterized routes
  router.post('/', (req, res, next) => userController.createUser(req, res, next));
  router.get('/phone/:phoneNumber', (req, res, next) => userController.getUserByPhoneNumber(req, res, next));
  router.get('/:id', (req, res, next) => userController.getUserById(req, res, next));
  router.put('/:id', (req, res, next) => userController.updateUser(req, res, next));
  router.delete('/:id', (req, res, next) => userController.deleteUser(req, res, next));
  router.get('/', (req, res, next) => userController.getAllUsers(req, res, next));

  return router;
}

