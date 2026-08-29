import type { NextFunction, Request, Response } from 'express';

const unsafeKey = /(^\$)|\./;

function sanitize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const clean: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if (!unsafeKey.test(key)) clean[key] = sanitize(child);
    }
    return clean;
  }
  return value;
}

/** Removes MongoDB operator / dotted keys before validation and query construction. */
export function sanitizeRequest(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') req.body = sanitize(req.body);
  next();
}
