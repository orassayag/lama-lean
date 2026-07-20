import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import createError from 'http-errors';

type ValidateTarget = 'body' | 'query' | 'params';

export const validate =
  (schema: ZodSchema, target: ValidateTarget = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    let data: unknown;
    if (target === 'body') data = req.body;
    else if (target === 'query') data = req.query;
    else data = req.params;

    const result = schema.safeParse(data);
    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ');
      next(createError(400, message));
      return;
    }

    if (target === 'body') req.body = result.data;
    else if (target === 'query') req.query = result.data as Request['query'];
    else req.params = result.data as Request['params'];

    next();
  };
