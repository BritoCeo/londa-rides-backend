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
          const keyValue = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
          
          // Check if it looks like a JSON string (starts with { or [)
          const looksLikeJson = keyValue.startsWith('{') || keyValue.startsWith('[');
          
          // Check if it looks like a file path (starts with /, ./, ../, or contains path separators)
          const looksLikePath = keyValue.startsWith('/') || 
                               keyValue.startsWith('./') || 
                               keyValue.startsWith('../') ||
                               keyValue.includes('\\') ||
                               (keyValue.includes('/') && !looksLikeJson);
          
          if (looksLikeJson) {
            // Try parsing as JSON string first (for Render/cloud deployments)
            try {
              serviceAccount = JSON.parse(keyValue);
            } catch (parseError) {
              console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY as JSON:', parseError);
              throw new Error('Invalid JSON format in FIREBASE_SERVICE_ACCOUNT_KEY');
            }
          } else if (looksLikePath) {
            // Fallback to file path (for local development)
            try {
              const serviceAccountPath = path.resolve(keyValue);
              serviceAccount = require(serviceAccountPath);
            } catch (fileError) {
              console.error('❌ Failed to load Firebase key from file path:', fileError);
              throw new Error(`Cannot load Firebase key from file path: ${keyValue}`);
            }
          } else {
            // Try parsing as JSON anyway (might be a valid JSON string without leading brace)
            try {
              serviceAccount = JSON.parse(keyValue);
            } catch (parseError) {
              console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY does not appear to be valid JSON or a file path');
              throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY must be either a valid JSON string or a file path');
            }
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

  // Manually construct and register repository (tsyringe metadata issue workaround)
  // Note: Repository requires Firestore, but we allow null for graceful degradation
  const repositoryLogger = Container.resolve<ILogger>(TYPES.Logger);
  const userRepository = new FirestoreUserRepository(
    firestore as Firestore, // Type assertion needed since initializeFirestore can return null
    repositoryLogger
  );
  Container.registerInstance<IUserRepository>(TYPES.UserRepository, userRepository);

  // Manually construct and register service (tsyringe metadata issue workaround)
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
  const logger = Container.resolve<ILogger>(TYPES.Logger);
  logger.info(`Starting User Service - PORT from env: ${process.env.PORT || 'not set'}, using: ${PORT}`);
  const server = http.createServer(app);

  server.on('error', (error: NodeJS.ErrnoException) => {
    const logger = Container.resolve<ILogger>(TYPES.Logger);
    if (error.code === 'EADDRINUSE') {
      logger.error(`Port ${PORT} is already in use. Please check if another service is running on this port.`);
      process.exit(1);
    } else {
      logger.error(`Server error: ${error.message}`, error);
      process.exit(1);
    }
  });

  server.listen(PORT, () => {
    const logger = Container.resolve<ILogger>(TYPES.Logger);
    logger.info(`User Service started on port ${PORT}`);
  });
}

startServer();

