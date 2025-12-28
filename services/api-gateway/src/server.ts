import 'reflect-metadata';
import dotenv from 'dotenv';
import http from 'http';
import * as path from 'path';
import { StructuredLogger } from '@londa-rides/shared';
import { ApiGateway } from './gateway/Gateway';

// Load environment-specific .env file
const env = process.env.NODE_ENV || 'dev';
const envFile = `.env.${env}`;
const envPath = path.resolve(__dirname, '..', envFile);

// Try to load environment-specific file, fallback to .env
dotenv.config({ path: envPath });
dotenv.config(); // Fallback to .env if env-specific file doesn't exist

const logger = new StructuredLogger();
const gateway = new ApiGateway(logger);
const app = gateway.getApp();

const PORT = parseInt(process.env.PORT || '8000', 10);
const EXPECTED_PORT = 8000;
logger.info(`Starting API Gateway - PORT from env: ${process.env.PORT || 'not set'}, using: ${PORT}`);

// Validate PORT configuration
if (PORT !== EXPECTED_PORT) {
  logger.warn(`⚠️  WARNING: API Gateway is using port ${PORT} but expected port ${EXPECTED_PORT}. This may indicate a configuration issue.`);
  logger.warn(`   In Render, ensure the service has PORT=${EXPECTED_PORT} set in environment variables.`);
  logger.warn(`   If running via 'npm run uat:all', services should be started individually with correct PORT values.`);
}

const server = http.createServer(app);

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use. Please check if another service is running on this port.`);
    process.exit(1);
  } else {
    logger.error(`Server error: ${error.message}`, error);
    process.exit(1);
  }
});

server.listen(PORT, () => {
  logger.info(`API Gateway started on port ${PORT}`);
});

