import mongoose, { models, model, Schema } from "mongoose";

export interface IUser {
  _id?: mongoose.Types.ObjectId;
  fullname: string;
  email: string;
  password: string;
  username: string;
  role?: "user" | "doctor" | "hospital";
  phone?: string;
  profileImage?: string;
  gender?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullname: {
      type: String,
      required: [true, "Please Provide a username"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please Provide a email"],
      unique: true,
    },
    username: {
      type: String,
      required: [true, "Please Provide a username"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please Provide a email"],
    },
    role: {
      type: String,
      enum: ["user", "doctor", "hospital"],
      default: "user",
    },
    phone: {
      type: String,
      required: false,
    },
    profileImage: { type: String },
    gender: { type: String },
  },
  { timestamps: true }
);

const User = models?.users || model<IUser>("users", userSchema);

export default User;
