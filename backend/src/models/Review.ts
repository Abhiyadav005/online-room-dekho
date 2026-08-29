import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

export interface IReview {
  _id: Types.ObjectId;
  room: Types.ObjectId;
  user: Types.ObjectId;
  rating: number;
  comment: string;
  status: 'visible' | 'hidden';
  createdAt: Date;
  updatedAt: Date;
}

export type ReviewDocument = HydratedDocument<IReview>;

const reviewSchema = new Schema<IReview>(
  {
    room: { type: Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, minlength: 4, maxlength: 1_000 },
    status: { type: String, enum: ['visible', 'hidden'], default: 'visible', index: true }
  },
  { timestamps: true, versionKey: false }
);

reviewSchema.index({ room: 1, user: 1 }, { unique: true });
reviewSchema.index({ room: 1, status: 1, createdAt: -1 });

export const Review = model<IReview>('Review', reviewSchema);
