import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ConnectDB } from "../../../../dbConfig/dbConfig";
import Prescription from "../../../../models/Prescription.model";
import User from "../../../../models/user.models";
import Doctor from "../../../../models/Doctor.model";
import { authOptions } from "../../../../utils/authOptions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ConnectDB();

    // Await params for Next.js 15+
    const { id } = await params;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const prescription = await Prescription.findById(id)
      .populate("patientId", "fullname email")
      .populate("doctorId", "name email specialization");

    if (!prescription) {
      return NextResponse.json(
        { success: false, error: "Prescription not found" },
        { status: 404 }
      );
    }

    // Check authorization
    const doctor = await Doctor.findOne({ email: session.user.email });
    const user = await User.findOne({ email: session.user.email });

    if (doctor) {
      // Doctor can access if they created the prescription
      if (prescription.doctorId.toString() !== doctor._id.toString()) {
        return NextResponse.json(
          { success: false, error: "Access denied" },
          { status: 403 }
        );
      }
    } else if (user) {
      // Patient can access if it's their prescription
      if (prescription.patientId.toString() !== user._id.toString()) {
        return NextResponse.json(
          { success: false, error: "Access denied" },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      prescription,
    });
  } catch (error) {
    console.error("Fetch prescription error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch prescription" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ConnectDB();

    // Await params for Next.js 15+
    const { id } = await params;

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
        { success: false, error: "Only doctors can update prescriptions" },
        { status: 403 }
      );
    }

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return NextResponse.json(
        { success: false, error: "Prescription not found" },
        { status: 404 }
      );
    }

    // Check if doctor created this prescription
    if (prescription.doctorId.toString() !== doctor._id.toString()) {
      return NextResponse.json(
        { success: false, error: "You can only update your own prescriptions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { notes, followUpDate, medications, status } = body;

    // Validate medications if provided
    if (medications) {
      for (const med of medications) {
        if (!med.name || !med.dosage || !med.frequency || !med.duration) {
          return NextResponse.json(
            { success: false, error: "All medication fields are required" },
            { status: 400 }
          );
        }
      }
    }

    // Update prescription
    const updatedPrescription = await Prescription.findByIdAndUpdate(
      id,
      {
        notes,
        followUpDate: followUpDate ? new Date(followUpDate) : undefined,
        medications,
        status,
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      prescription: updatedPrescription,
    });
  } catch (error) {
    console.error("Update prescription error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update prescription" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ConnectDB();

    // Await params for Next.js 15+
    const { id } = await params;

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
        { success: false, error: "Only doctors can delete prescriptions" },
        { status: 403 }
      );
    }

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return NextResponse.json(
        { success: false, error: "Prescription not found" },
        { status: 404 }
      );
    }

    // Check if doctor created this prescription
    if (prescription.doctorId.toString() !== doctor._id.toString()) {
      return NextResponse.json(
        { success: false, error: "You can only delete your own prescriptions" },
        { status: 403 }
      );
    }

    // Soft delete by updating status to Cancelled
    await Prescription.findByIdAndUpdate(id, { status: "Cancelled" });

    return NextResponse.json({
      success: true,
      message: "Prescription cancelled successfully",
    });
  } catch (error) {
    console.error("Delete prescription error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete prescription" },
      { status: 500 }
    );
  }
}
