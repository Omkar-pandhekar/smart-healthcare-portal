import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ConnectDB } from "../../../dbConfig/dbConfig";

// Import models in order to ensure proper registration
import User from "../../../models/user.models";
import Doctor from "../../../models/Doctor.model";
import Prescription from "../../../models/Prescription.model";

import { authOptions } from "../../../utils/authOptions";

export async function POST(request: NextRequest) {
  try {
    await ConnectDB();

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is a doctor
    const doctor = await Doctor.findOne({ email: session.user.email });
    if (!doctor) {
      return NextResponse.json(
        { success: false, error: "Only doctors can create prescriptions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { patientId, appointmentId, notes, followUpDate, medications } = body;

    // Validate required fields
    if (
      !patientId ||
      !appointmentId ||
      !medications ||
      medications.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Patient ID, Appointment ID, and medications are required",
        },
        { status: 400 }
      );
    }

    // Validate patient exists
    const patient = await User.findById(patientId);
    if (!patient) {
      return NextResponse.json(
        { success: false, error: "Patient not found" },
        { status: 404 }
      );
    }

    // Check if prescription already exists for this appointment
    const existingPrescription = await Prescription.findOne({ appointmentId });
    if (existingPrescription) {
      return NextResponse.json(
        {
          success: false,
          error: "Prescription already exists for this appointment",
        },
        { status: 400 }
      );
    }

    // Validate medications
    for (const med of medications) {
      if (!med.name || !med.dosage || !med.frequency || !med.duration) {
        return NextResponse.json(
          { success: false, error: "All medication fields are required" },
          { status: 400 }
        );
      }
    }

    // Create prescription
    const prescription = new Prescription({
      patientId,
      doctorId: doctor._id,
      appointmentId,
      notes,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      medications,
    });

    await prescription.save();

    // Return prescription without populate for now
    return NextResponse.json({
      success: true,
      prescription: {
        _id: prescription._id,
        patientId: prescription.patientId,
        doctorId: prescription.doctorId,
        appointmentId: prescription.appointmentId,
        status: prescription.status,
        notes: prescription.notes,
        followUpDate: prescription.followUpDate,
        medications: prescription.medications,
        createdAt: prescription.createdAt,
        updatedAt: prescription.updatedAt,
      },
    });
  } catch (error) {
    console.error("Create prescription error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create prescription" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await ConnectDB();

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const doctorId = searchParams.get("doctorId");
    const status = searchParams.get("status");

    // Build query based on user role
    let query: any = {};

    // Check if user is a doctor
    const doctor = await Doctor.findOne({ email: session.user.email });
    if (doctor) {
      // Doctor can see their own prescriptions or filter by patient
      query.doctorId = doctor._id;
      if (patientId) {
        query.patientId = patientId;
      }
    } else {
      // Patient can only see their own prescriptions
      const user = await User.findOne({ email: session.user.email });
      if (!user) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }
      query.patientId = user._id;
    }

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // Fetch prescriptions with populated data
    const prescriptions = await Prescription.find(query)
      .populate("patientId", "fullname email")
      .populate("doctorId", "name email specialization")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      prescriptions,
    });
  } catch (error) {
    console.error("Fetch prescriptions error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch prescriptions" },
      { status: 500 }
    );
  }
}
