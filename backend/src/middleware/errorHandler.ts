import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger';
import { AppError } from '../utils/AppError';

export const notFound: RequestHandler = (req, _res, next) => next(new AppError(`Route ${req.method} ${req.originalUrl} was not found`, 404, 'NOT_FOUND'));

export const errorHandler: ErrorRequestHandler = (err: unknown, req, res, _next) => {
  let error = err instanceof AppError ? err : undefined;
  if (err instanceof ZodError) error = new AppError('Request validation failed', 400, 'VALIDATION_ERROR', err.flatten());
  if ((err as { name?: string }).name === 'CastError') error = new AppError('Invalid resource identifier', 400, 'INVALID_ID');
  if ((err as { code?: number }).code === 11000) error = new AppError('A record with that value already exists', 409, 'DUPLICATE_RESOURCE');
  if ((err as { name?: string }).name === 'ValidationError') error = new AppError('Database validation failed', 400, 'VALIDATION_ERROR');

  const statusCode = error?.statusCode ?? 500;
  const code = error?.code ?? 'INTERNAL_ERROR';
  if (statusCode >= 500) logger.error({ err, path: req.originalUrl, method: req.method }, 'Unhandled request error');
  else logger.warn({ code, path: req.originalUrl, method: req.method }, error?.message);

  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? 'Something went wrong' : error?.message ?? 'Something went wrong',
    code,
    ...(error?.details ? { details: error.details } : {})
  });
};
