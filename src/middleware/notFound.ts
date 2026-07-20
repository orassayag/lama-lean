import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';

export const notFound = (_req: Request, _res: Response, next: NextFunction): void => {
  next(createError(404, 'Route not found'));
};
