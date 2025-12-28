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
  res.json({ status: 'healthy', service: 'auth-service', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 8001;
const server = http.createServer(app);

server.listen(PORT, () => {
  logger.info(`Auth Service started on port ${PORT}`);
});

