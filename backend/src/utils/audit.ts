import type { Request } from 'express';
import type { Types } from 'mongoose';
import { AuditLog } from '../models/AuditLog';
import { logger } from '../config/logger';

interface AuditInput {
  actor?: Types.ObjectId;
  action: string;
  entityType: string;
  entityId?: Types.ObjectId;
  metadata?: Record<string, unknown>;
}

/** Audit failures must never turn a completed user request into a failure. */
export async function recordAudit(req: Request, input: AuditInput): Promise<void> {
  try {
    await AuditLog.create({
      ...input,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')?.slice(0, 512)
    });
  } catch (error) {
    logger.error({ err: error, action: input.action }, 'Failed to write audit log');
  }
}
