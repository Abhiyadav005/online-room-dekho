import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

export interface IEnquiry {
  _id: Types.ObjectId;
  tenant: Types.ObjectId;
  room: Types.ObjectId;
  owner: Types.ObjectId;
  message: string;
  contactPhone?: string;
  status: 'new' | 'contacted' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export type EnquiryDocument = HydratedDocument<IEnquiry>;

const enquirySchema = new Schema<IEnquiry>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    room: { type: Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, required: true, trim: true, minlength: 5, maxlength: 1_500 },
    contactPhone: { type: String, trim: true, maxlength: 20 },
    status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new', index: true }
  },
  { timestamps: true, versionKey: false }
);

enquirySchema.index({ owner: 1, status: 1, createdAt: -1 });
enquirySchema.index({ tenant: 1, room: 1, createdAt: -1 });

export const Enquiry = model<IEnquiry>('Enquiry', enquirySchema);
