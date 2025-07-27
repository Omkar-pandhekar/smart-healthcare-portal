import mongoose, { Schema, Document } from "mongoose";

export interface IConsent extends Document {
  user: mongoose.Types.ObjectId;
  consentType: string;
  granted: boolean;
  grantedAt: Date;
  revokedAt?: Date;
  details?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConsentSchema = new Schema<IConsent>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    consentType: { type: String, required: true },
    granted: { type: Boolean, required: true },
    grantedAt: { type: Date, required: true },
    revokedAt: { type: Date },
    details: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Consent ||
  mongoose.model<IConsent>("Consent", ConsentSchema);
