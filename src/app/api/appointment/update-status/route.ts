import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "@/dbConfig/dbConfig";
import Appointment from "@/models/Appointment.model";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars

export async function POST(request: NextRequest) {
  try {
    await ConnectDB();
    const reqBody = await request.json();
    const { appointmentId, status } = reqBody;
    if (!appointmentId || !status) {
      return NextResponse.json(
        { error: "appointmentId and status are required" },
        { status: 400 }
      );
    }
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }
    appointment.status = status;
    await appointment.save();
    const populated = await Appointment.findById(appointmentId)
      .populate("doctor", "name specialization email")
      .populate("user", "fullname email");
    return NextResponse.json({ success: true, appointment: populated });
  } catch (error) {
    console.error("Update appointment status error:", error);
    return NextResponse.json(
      { error: "Failed to update appointment status" },
      { status: 500 }
    );
  }
}
