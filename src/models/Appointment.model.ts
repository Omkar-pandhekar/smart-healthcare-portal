import mongoose, { Schema, Document } from "mongoose";

export interface IAppointment extends Document {
  user: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  date: string;
  time: string;
  status: "booked" | "confirmed" | "cancelled" | "completed";
  type: "in-person" | "telemedicine";
  notes?: string;
  notificationSent?: boolean;
  paymentStatus?: "unpaid" | "paid" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "users", required: true },
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: {
      type: String,
      enum: ["booked", "confirmed", "cancelled", "completed"],
      default: "booked",
    },
    type: {
      type: String,
      enum: ["in-person", "telemedicine"],
      default: "in-person",
    },
    notes: { type: String },
    notificationSent: { type: Boolean, default: false },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Appointment ||
  mongoose.model<IAppointment>("Appointment", AppointmentSchema);
