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

const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

server.listen(PORT, () => {
  logger.info(`API Gateway started on port ${PORT}`);
});

