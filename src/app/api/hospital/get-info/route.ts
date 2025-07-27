import { ConnectDB } from "@/dbConfig/dbConfig";
import User from "@/models/user.models";
import Hospital from "@/models/hospital.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await ConnectDB();
    const reqBody = await request.json();
    const { email } = reqBody;
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    // Try to find hospital by email
    const findHospital = await Hospital.findOne({ email });
    if (findHospital) {
      // Exclude password from response (do not include it at all)
      const hospitalObj = findHospital.toObject();
      delete hospitalObj.password;
      return NextResponse.json({
        message: "Hospital info fetched successfully",
        success: true,
        hospital: hospitalObj,
        isHospitalProfile: true,
      });
    }
    // If not found, get user info for prefill
    const findUser = await User.findOne({ email });
    if (!findUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userObj = findUser.toObject();
    // Only return basic info for prefill
    return NextResponse.json({
      message: "User info fetched for hospital prefill",
      success: true,
      hospital: {
        name: userObj.fullname || userObj.name || "",
        email: userObj.email || "",
      },
      isHospitalProfile: false,
    });
  } catch (error) {
    console.error("Hospital Fetch API error:", error);
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
