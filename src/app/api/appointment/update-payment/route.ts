import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "@/dbConfig/dbConfig";
import Appointment from "@/models/Appointment.model";

export async function POST(request: NextRequest) {
  try {
    await ConnectDB();
    const reqBody = await request.json();
    const { appointmentId, paymentStatus } = reqBody;
    if (!appointmentId || !paymentStatus) {
      return NextResponse.json(
        { error: "appointmentId and paymentStatus are required" },
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
    appointment.paymentStatus = paymentStatus;
    await appointment.save();
    const populated = await Appointment.findById(appointmentId)
      .populate("doctor", "name specialization email")
      .populate("user", "fullname email");
    return NextResponse.json({ success: true, appointment: populated });
  } catch (error) {
    console.error("Update appointment payment status error:", error);
    return NextResponse.json(
      { error: "Failed to update appointment payment status" },
      { status: 500 }
    );
  }
}
