import { Router } from 'express';
import { postApplicationMatch } from '../controllers/applicationMatch.controller.js';
import { validate } from '../middleware/validate.js';
import { ApplicationInputSchema } from '../schemas/applicationInput.schema.js';

export const applicationMatchRouter = Router();

applicationMatchRouter.post('/', validate(ApplicationInputSchema), postApplicationMatch);
