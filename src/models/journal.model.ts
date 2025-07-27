import mongoose, { models, model, Schema } from "mongoose";

export interface IJournal {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // Reference to the user
  title: string;
  content: string; // The user's thoughts
  mood?: string; // Optional mood field
  createdAt?: Date;
  updatedAt?: Date;
}

const journalSchema = new Schema<IJournal>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please provide a title"],
    },
    content: {
      type: String,
      required: [true, "Please provide your thoughts"],
    },
    mood: {
      type: String,
    },
  },
  { timestamps: true }
);

const Journal = models?.journal || model<IJournal>("journal", journalSchema);

export default Journal;
