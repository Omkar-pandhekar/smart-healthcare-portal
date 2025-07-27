import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "@/dbConfig/dbConfig";
import Appointment from "@/models/Appointment.model";
import User from "@/models/user.models";

export async function POST(request: NextRequest) {
  try {
    await ConnectDB();
    const reqBody = await request.json();
    const { email } = reqBody;
    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const appointments = await Appointment.find({ user: user._id })
      .populate("doctor", "name specialization email")
      .sort({ date: -1, time: -1 });
    return NextResponse.json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error("Fetch user appointments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}
