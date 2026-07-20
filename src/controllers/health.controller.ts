import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getHealthStatus } from '../services/health.service.js';

export const getHealth = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const data = await getHealthStatus();
  res.json({ success: true, data });
});
