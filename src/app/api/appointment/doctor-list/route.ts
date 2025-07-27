import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "@/dbConfig/dbConfig";
import Appointment from "@/models/Appointment.model";
// eslint-disable-next-line @typescript-eslint/no-unused-vars

export async function POST(request: NextRequest) {
  try {
    await ConnectDB();
    const reqBody = await request.json();
    const { doctorId } = reqBody;
    if (!doctorId) {
      return NextResponse.json(
        { error: "doctorId is required" },
        { status: 400 }
      );
    }
    const appointments = await Appointment.find({ doctor: doctorId })
      .populate("user", "fullname email")
      .populate("doctor", "name specialization email consultationFees")
      .sort({ date: -1, time: -1 });
    return NextResponse.json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error("Fetch doctor appointments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}
