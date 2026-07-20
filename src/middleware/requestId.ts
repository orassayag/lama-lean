import { Request, Response, NextFunction, RequestHandler } from 'express';
import { randomUUID } from 'crypto';

export const requestId =
  (): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    const headerValue = req.headers['x-request-id'];
    const id = (Array.isArray(headerValue) ? headerValue[0] : headerValue) ?? randomUUID();
    req.id = id;
    res.setHeader('x-request-id', id);
    next();
  };
