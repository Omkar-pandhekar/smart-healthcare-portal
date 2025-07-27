import { ConnectDB } from "@/dbConfig/dbConfig";
import Hospital from "@/models/hospital.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await ConnectDB();
    const reqBody = await request.json();
    const { _id } = reqBody;
    if (!_id) {
      return NextResponse.json(
        { error: "Hospital ID (_id) is required" },
        { status: 400 }
      );
    }
    const hospital = await Hospital.findById(_id);
    if (!hospital) {
      return NextResponse.json(
        { error: "Hospital not found" },
        { status: 404 }
      );
    }
    const hospitalObj = hospital.toObject();
    delete hospitalObj.password;
    return NextResponse.json({
      message: "Hospital info fetched successfully",
      success: true,
      hospital: hospitalObj,
    });
  } catch (error) {
    console.error("Get Hospital Info API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
