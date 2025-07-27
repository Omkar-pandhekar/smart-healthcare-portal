import mongoose, { Schema, Document } from "mongoose";

export interface IMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

export interface IPrescription extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  appointmentId: mongoose.Types.ObjectId; // Added to link to specific appointment
  status: "Active" | "Completed" | "Cancelled";
  notes?: string;
  followUpDate?: Date;
  medications: IMedication[];
  createdAt: Date;
  updatedAt: Date;
}

const MedicationSchema = new Schema<IMedication>({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
  notes: { type: String },
});

const PrescriptionSchema = new Schema<IPrescription>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Completed", "Cancelled"],
      default: "Active",
    },
    notes: { type: String },
    followUpDate: { type: Date },
    medications: [MedicationSchema],
  },
  { timestamps: true }
);

// Index for efficient queries
PrescriptionSchema.index({ patientId: 1, createdAt: -1 });
PrescriptionSchema.index({ doctorId: 1, createdAt: -1 });
PrescriptionSchema.index({ appointmentId: 1 }, { unique: true }); // One prescription per appointment
PrescriptionSchema.index({ status: 1 });

export default mongoose.models.Prescription ||
  mongoose.model<IPrescription>("Prescription", PrescriptionSchema);
