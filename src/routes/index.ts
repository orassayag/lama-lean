import { Router } from 'express';
import { applicationMatchRouter } from './applicationMatch.routes.js';
import { healthRouter } from './health.routes.js';

export const router = Router();

router.use('/health', healthRouter);
router.use('/applicationMatch', applicationMatchRouter);
