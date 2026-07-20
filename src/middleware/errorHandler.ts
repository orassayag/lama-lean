import { Request, Response, NextFunction } from 'express';
import { HttpError } from 'http-errors';
import { config } from '../config/env.js';

export const errorHandler = (
  err: Error | HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  const message =
    statusCode === 500 && config.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;

  res.status(statusCode).json({
    success: false,
    error: { message },
  });
};
