import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

export interface IFavourite {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  room: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type FavouriteDocument = HydratedDocument<IFavourite>;

const favouriteSchema = new Schema<IFavourite>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    room: { type: Schema.Types.ObjectId, ref: 'Room', required: true, index: true }
  },
  { timestamps: true, versionKey: false }
);

favouriteSchema.index({ user: 1, room: 1 }, { unique: true });

export const Favourite = model<IFavourite>('Favourite', favouriteSchema);
