import mongoose, { Schema, Document } from "mongoose";

export interface ISymptomCheck extends Document {
  user: mongoose.Types.ObjectId;
  symptoms: string;
  answers: Array<{
    question: string;
    answer: string;
  }>;
  aiResults: Array<{
    condition: string;
    likelihood: number;
    specialist: string;
    urgency: string;
    infoLinks: string[];
  }>;
  recommendedSpecialist: string;
  urgency: string;
  createdAt: Date;
  updatedAt: Date;
}

const SymptomCheckSchema = new Schema<ISymptomCheck>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    symptoms: { type: String, required: true },
    answers: [
      {
        question: String,
        answer: String,
      },
    ],
    aiResults: [
      {
        condition: String,
        likelihood: Number,
        specialist: String,
        urgency: String,
        infoLinks: [String],
      },
    ],
    recommendedSpecialist: { type: String },
    urgency: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.SymptomCheck ||
  mongoose.model<ISymptomCheck>("SymptomCheck", SymptomCheckSchema);
