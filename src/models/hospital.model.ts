import mongoose, { Schema, Document } from "mongoose";

export interface IHospital extends Document {
  name: string;
  password: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    location: { type: "Point"; coordinates: [number, number] }; // For geospatial queries
  };
  phone?: string;
  email?: string;
  website?: string;
  doctors: mongoose.Types.ObjectId[]; // Array of Doctor IDs
  images?: string[]; // up to 4 image URLs
  createdAt: Date;
  updatedAt: Date;
}

const HospitalSchema = new Schema<IHospital>(
  {
    name: { type: String, required: true },
    password: { type: String, required: true },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
      location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
      },
    },
    phone: String,
    email: String,
    website: String,
    doctors: [{ type: Schema.Types.ObjectId, ref: "Doctor" }],
    images: {
      type: [String],
      validate: [(arr) => arr.length <= 4, "Maximum 4 images allowed"],
      default: [],
    },
  },
  { timestamps: true }
);

HospitalSchema.index({ "address.location": "2dsphere" }); // For map/geospatial queries

export default mongoose.models.Hospital ||
  mongoose.model<IHospital>("Hospital", HospitalSchema);
