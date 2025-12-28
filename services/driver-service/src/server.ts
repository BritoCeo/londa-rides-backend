import 'reflect-metadata';
import dotenv from 'dotenv';
import http from 'http';
import express from 'express';
import cors from 'cors';
import * as path from 'path';
import { StructuredLogger } from '@londa-rides/shared';

// Load environment-specific .env file
const env = process.env.NODE_ENV || 'dev';
const envFile = `.env.${env}`;
const envPath = path.resolve(__dirname, '..', envFile);

// Try to load environment-specific file, fallback to .env
dotenv.config({ path: envPath });
dotenv.config(); // Fallback to .env if env-specific file doesn't exist

const logger = new StructuredLogger();
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'driver-service', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 8003;
logger.info(`Starting Driver Service - PORT from env: ${process.env.PORT || 'not set'}, using: ${PORT}`);
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
  logger.info(`Driver Service started on port ${PORT}`);
});

