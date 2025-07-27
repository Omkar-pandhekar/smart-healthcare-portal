import mongoose, { models, model, Schema } from "mongoose";

export interface IFavoriteQuote {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  quote: string;
  mood?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const favoriteQuoteSchema = new Schema<IFavoriteQuote>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    quote: {
      type: String,
      required: [true, "Quote is required"],
    },
    mood: {
      type: String,
    },
  },
  { timestamps: true }
);

const FavoriteQuote =
  models?.favoritequote ||
  model<IFavoriteQuote>("favoritequote", favoriteQuoteSchema);

export default FavoriteQuote;
