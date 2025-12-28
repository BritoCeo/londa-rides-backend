import 'reflect-metadata';
import dotenv from 'dotenv';
import http from 'http';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import * as path from 'path';
import { Container } from '@londa-rides/shared';
import { TYPES } from '@londa-rides/shared';
import { StructuredLogger, ILogger } from '@londa-rides/shared';
import { FirestoreUserRepository } from './repositories/FirestoreUserRepository';
import { IUserRepository } from './repositories/IUserRepository';
import { UserService } from './services/UserService';
import { IUserService } from './services/IUserService';
import { UserController } from './controllers/UserController';
import { createApp } from './app';

// Load environment-specific .env file
const env = process.env.NODE_ENV || 'dev';
const envFile = `.env.${env}`;
const envPath = path.resolve(__dirname, '..', envFile);

// Try to load environment-specific file, fallback to .env
dotenv.config({ path: envPath });
dotenv.config(); // Fallback to .env if env-specific file doesn't exist

// Initialize Firestore
function initializeFirestore(): Firestore | null {
  try {
    if (getApps().length === 0) {
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        try {
          let serviceAccount;
          // Try parsing as JSON string first (for Render/cloud deployments)
          try {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
          } catch {
            // Fallback to file path (for local development)
            const serviceAccountPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            serviceAccount = require(serviceAccountPath);
          }
          initializeApp({
            credential: cert(serviceAccount),
            projectId: process.env.FIREBASE_PROJECT_ID || 'londa-cd054',
          });
          console.log('✅ Firebase initialized successfully');
        } catch (error) {
          console.error('❌ Failed to initialize Firestore:', error);
          console.log('⚠️  Service will start but database operations will fail');
          return null;
        }
      } else {
        console.log('⚠️  FIREBASE_SERVICE_ACCOUNT_KEY not set - using mock mode');
        return null;
      }
    }
    return getFirestore();
  } catch (error) {
    console.error('❌ Firestore initialization error:', error);
    return null;
  }
}

// Initialize dependencies
function setupDependencies(): void {
  // Register logger as singleton instance
  const logger = new StructuredLogger();
  Container.registerInstance<ILogger>(TYPES.Logger, logger);

  // Register Firestore
  const firestore = initializeFirestore();
  if (firestore) {
    Container.registerInstance<Firestore>(TYPES.Firestore, firestore);
  } else {
    logger.warn('Firestore not initialized - database operations will fail');
  }

  // Register repositories
  Container.register<IUserRepository>(TYPES.UserRepository, FirestoreUserRepository);

  // Manually construct and register service (tsyringe metadata issue workaround)
  const userRepository = Container.resolve<IUserRepository>(TYPES.UserRepository);
  const serviceLogger = Container.resolve<ILogger>(TYPES.Logger);
  const userService = new UserService(userRepository, serviceLogger);
  Container.registerInstance<IUserService>(TYPES.UserService, userService);

  // Manually construct and register controller (tsyringe metadata issue workaround)
  const controllerLogger = Container.resolve<ILogger>(TYPES.Logger);
  const userController = new UserController(userService, controllerLogger);
  Container.registerInstance<UserController>(TYPES.UserController, userController);
}

// Start server
function startServer(): void {
  setupDependencies();

  const app = createApp();
  const PORT = process.env.PORT || 8002;
  const server = http.createServer(app);

  server.listen(PORT, () => {
    const logger = Container.resolve<ILogger>(TYPES.Logger);
    logger.info(`User Service started on port ${PORT}`);
  });
}

startServer();

