import mongoose, { Schema, models, model } from "mongoose";

export interface IMoodEntry {
  user: mongoose.Types.ObjectId;
  mood: string;
  date: Date;
}

const MoodSchema = new Schema<IMoodEntry>({
  user: { type: Schema.Types.ObjectId, ref: "users", required: true },
  mood: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
});

const Mood = models?.moods || model<IMoodEntry>("moods", MoodSchema);

export default Mood;
