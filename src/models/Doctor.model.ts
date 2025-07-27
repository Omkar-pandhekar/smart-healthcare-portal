import mongoose, { Schema, Document } from "mongoose";

export interface IDoctor extends Document {
  name: string;
  email: string;
  password: string;
  specialization: string;
  qualifications: string;
  experience: number;
  consultationFees: number;
  phone?: string;
  gender: string;
  profileImage?: string;
  hospital?: mongoose.Types.ObjectId;
  verificationStatus?: "pending" | "verified" | "rejected";
  averageRating?: number;
  totalRatings?: number;
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
    hospital: { type: Schema.Types.ObjectId, ref: "Hospital" },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Doctor ||
  mongoose.model<IDoctor>("Doctor", DoctorSchema);
