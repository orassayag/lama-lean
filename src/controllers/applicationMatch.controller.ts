import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import type { Application } from '../schemas/applicationInput.schema.js';
import { matchApplication } from '../services/applicationMatcher.js';

export const postApplicationMatch = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    // req.body is already validated and normalized by the `validate` middleware
    // (ApplicationInputSchema) wired in applicationMatch.routes.ts, ahead of this handler.
    const application = req.body as Application;
    const matchedLenderNames = matchApplication(application);
    res.json(matchedLenderNames);
  },
);
