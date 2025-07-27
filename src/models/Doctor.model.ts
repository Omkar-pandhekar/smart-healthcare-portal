import mongoose, { Schema, Document } from "mongoose";

export interface IDoctor extends Document {
  name: string;
  email: string;
  password: string;
  specialization: string;
  qualifications: string;
  experience: number;
  languages: string[];
  gender: string;
  profileImage?: string;
  consultationFees: number;
  availableSlots: Array<{
    date: string;
    slots: string[];
  }>;
  ratings: Array<{
    user: mongoose.Types.ObjectId;
    rating: number;
    review: string;
  }>;
  hospital?: mongoose.Types.ObjectId;
  verificationStatus?: "pending" | "verified" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    specialization: { type: String, required: true },
    qualifications: { type: String },
    experience: { type: Number },
    languages: [String],
    gender: { type: String },
    profileImage: { type: String },
    consultationFees: { type: Number, required: true },
    availableSlots: [
      {
        date: String,
        slots: [String],
      },
    ],
    ratings: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        rating: Number,
        review: String,
      },
    ],
    hospital: { type: Schema.Types.ObjectId, ref: "Hospital" },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Doctor ||
  mongoose.model<IDoctor>("Doctor", DoctorSchema);
