import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "../../../dbConfig/dbConfig";
import mongoose from "mongoose";
import User from "../../../models/user.models";
import Doctor from "../../../models/Doctor.model";
import Appointment from "../../../models/Appointment.model";
import Prescription from "../../../models/Prescription.model";

export async function GET(request: NextRequest) {
  try {
    await ConnectDB();

    // Check available models
    const availableModels = Object.keys(mongoose.models);

    // Test basic queries
    const userCount = await User.countDocuments();
    const doctorCount = await Doctor.countDocuments();
    const appointmentCount = await Appointment.countDocuments();
    const prescriptionCount = await Prescription.countDocuments();

    return NextResponse.json({
      success: true,
      availableModels,
      counts: {
        users: userCount,
        doctors: doctorCount,
        appointments: appointmentCount,
        prescriptions: prescriptionCount,
      },
    });
  } catch (error) {
    console.error("Test models error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to test models" },
      { status: 500 }
    );
  }
}
