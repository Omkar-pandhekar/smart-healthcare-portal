import mongoose, { Schema, Document } from "mongoose";
import User from "./user.models";
import Doctor from "./Doctor.model";
import Hospital from "./hospital.model";

export interface IRating extends Document {
  userId: mongoose.Types.ObjectId;
  targetType: "doctor" | "hospital";
  targetId: mongoose.Types.ObjectId;
  rating: number; // 1-5 stars
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema = new Schema<IRating>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetType: {
      type: String,
      enum: ["doctor", "hospital"],
      required: true,
    },
    targetId: { type: Schema.Types.ObjectId, required: true },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// Compound index to ensure one rating per user per target
RatingSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

export default mongoose.models.Rating ||
  mongoose.model<IRating>("Rating", RatingSchema);
