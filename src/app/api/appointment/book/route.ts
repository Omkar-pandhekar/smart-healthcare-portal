import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "@/dbConfig/dbConfig";
import Appointment from "@/models/Appointment.model";
import User from "@/models/user.models";
import Doctor from "@/models/Doctor.model";

export async function POST(request: NextRequest) {
  try {
    await ConnectDB();
    const reqBody = await request.json();
    const { userEmail, doctorId, date, time, type, notes } = reqBody;
    if (!userEmail || !doctorId || !date || !time || !type) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }
    // Check for slot conflict
    const conflict = await Appointment.findOne({
      doctor: doctorId,
      date,
      time,
      status: { $ne: "cancelled" },
    });
    if (conflict) {
      return NextResponse.json(
        { error: "This time slot is already booked." },
        { status: 400 }
      );
    }
    const appointment = await Appointment.create({
      user: user._id,
      doctor: doctor._id,
      date,
      time,
      type,
      notes,
      status: "booked",
    });
    const populated = await Appointment.findById(appointment._id)
      .populate("doctor", "name specialization email")
      .populate("user", "fullname email");
    return NextResponse.json({ success: true, appointment: populated });
  } catch (error) {
    console.error("Book appointment error:", error);
    return NextResponse.json(
      { error: "Failed to book appointment" },
      { status: 500 }
    );
  }
}
