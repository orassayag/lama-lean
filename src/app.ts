import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { pinoHttp } from 'pino-http';
import { config } from './config/env.js';
import { logger } from './config/logger.js';
import { router } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { requestId } from './middleware/requestId.js';

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 100;

export const createApp = (): express.Express => {
  const app = express();

  app.use(requestId());
  app.use(helmet());
  app.use(cors({ origin: config.CORS_ORIGIN }));
  app.use(rateLimit({ windowMs: RATE_LIMIT_WINDOW_MS, limit: RATE_LIMIT_MAX }));
  app.use(pinoHttp({ logger }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(router);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
