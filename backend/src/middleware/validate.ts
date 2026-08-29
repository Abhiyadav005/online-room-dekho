import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';
import { AppError } from '../utils/AppError';

type Source = 'body' | 'query' | 'params';

/** Validated values replace raw request values, so downstream code never consumes untrusted input. */
export const validate = (schema: ZodTypeAny, source: Source = 'body') => (req: Request, _res: Response, next: NextFunction): void => {
  const parsed = schema.safeParse(req[source]);
  if (!parsed.success) {
    next(new AppError('Request validation failed', 400, 'VALIDATION_ERROR', parsed.error.flatten()));
    return;
  }
  Object.assign(req[source], parsed.data);
  next();
};
