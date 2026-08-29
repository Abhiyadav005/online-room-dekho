import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

export const reportReasons = [
  'fake_room',
  'fake_owner',
  'wrong_price',
  'wrong_location',
  'scam',
  'duplicate_listing',
  'inappropriate_content',
  'other'
] as const;

export interface IReport {
  _id: Types.ObjectId;
  reporter: Types.ObjectId;
  targetType: 'room' | 'owner' | 'review' | 'user';
  targetId: Types.ObjectId;
  reason: (typeof reportReasons)[number];
  description?: string;
  status: 'open' | 'under_review' | 'resolved' | 'dismissed';
  resolutionNote?: string;
  resolvedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type ReportDocument = HydratedDocument<IReport>;

const reportSchema = new Schema<IReport>(
  {
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetType: { type: String, enum: ['room', 'owner', 'review', 'user'], required: true, index: true },
    targetId: { type: Schema.Types.ObjectId, required: true, index: true },
    reason: { type: String, enum: reportReasons, required: true },
    description: { type: String, trim: true, maxlength: 1_500 },
    status: { type: String, enum: ['open', 'under_review', 'resolved', 'dismissed'], default: 'open', index: true },
    resolutionNote: { type: String, trim: true, maxlength: 1_000 },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true, versionKey: false }
);

reportSchema.index({ targetType: 1, targetId: 1, status: 1 });

export const Report = model<IReport>('Report', reportSchema);
