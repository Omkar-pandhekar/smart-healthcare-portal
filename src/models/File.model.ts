import mongoose, { Schema, Document } from "mongoose";

export interface IFile extends Document {
  fileName: string;
  fileUrl: string;
  category?: string;
  owner: mongoose.Types.ObjectId;
  doctor?: mongoose.Types.ObjectId;
  fileType?: string;
  tags?: string[];
  sharedWith?: mongoose.Types.ObjectId[];
  uploadDate?: Date;
}

const FileSchema = new Schema<IFile>(
  {
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    category: { type: String, default: "Uncategorized" },
    owner: { type: Schema.Types.ObjectId, ref: "users", required: true },
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor" },
    fileType: { type: String },
    tags: [String],
    sharedWith: [{ type: Schema.Types.ObjectId, ref: "users" }],
    uploadDate: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export default mongoose.models.File ||
  mongoose.model<IFile>("File", FileSchema);
