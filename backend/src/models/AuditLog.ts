import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

export interface IAuditLog {
  _id: Types.ObjectId;
  actor?: Types.ObjectId;
  action: string;
  entityType: string;
  entityId?: Types.ObjectId;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AuditLogDocument = HydratedDocument<IAuditLog>;

const auditLogSchema = new Schema<IAuditLog>(
  {
    actor: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true, trim: true, maxlength: 120, index: true },
    entityType: { type: String, required: true, trim: true, maxlength: 80, index: true },
    entityId: { type: Schema.Types.ObjectId, index: true },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String, maxlength: 64 },
    userAgent: { type: String, maxlength: 512 }
  },
  { timestamps: true, versionKey: false }
);

auditLogSchema.index({ createdAt: -1 });

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);
