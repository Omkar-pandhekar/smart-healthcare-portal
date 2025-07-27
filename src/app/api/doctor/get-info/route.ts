import { ConnectDB } from "@/dbConfig/dbConfig";
import User from "@/models/user.models";
import Doctor from "@/models/Doctor.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Connect to database first
    await ConnectDB();

    const reqBody = await request.json();
    const { email } = reqBody;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Try to find doctor by email
    const findDoctor = await Doctor.findOne({ email });
    if (findDoctor) {
      // Exclude password from response
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...doctorWithoutPassword } =
        findDoctor.toObject();
      return NextResponse.json({
        message: "Doctor info fetched successfully",
        success: true,
        doctor: doctorWithoutPassword,
        isDoctorProfile: true,
      });
    }

    // If not found, get user info for prefill
    const findUser = await User.findOne({ email });
    if (!findUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = findUser.toObject();
    // Only return basic info for prefill
    return NextResponse.json({
      message: "User info fetched for doctor prefill",
      success: true,
      doctor: {
        name: userWithoutPassword.fullname || userWithoutPassword.name || "",
        email: userWithoutPassword.email || "",
      },
      isDoctorProfile: false,
    });
  } catch (error) {
    console.error("Doctor Fetch API error:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
