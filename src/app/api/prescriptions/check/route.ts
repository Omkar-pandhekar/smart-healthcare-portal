import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ConnectDB } from "../../../../dbConfig/dbConfig";
import Prescription from "../../../../models/Prescription.model";
import { authOptions } from "../../../../utils/authOptions";

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
    const appointmentId = searchParams.get("appointmentId");

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    // Check if prescription exists for this appointment
    const prescription = await Prescription.findOne({ appointmentId })
      .populate("patientId", "fullname email")
      .populate("doctorId", "name email specialization");

    return NextResponse.json({
      success: true,
      exists: !!prescription,
      prescription: prescription
        ? {
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
          }
        : null,
    });
  } catch (error) {
    console.error("Check prescription error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check prescription" },
      { status: 500 }
    );
  }
}
