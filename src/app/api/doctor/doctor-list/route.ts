import { NextResponse } from "next/server";
import { ConnectDB } from "@/dbConfig/dbConfig";
import Doctor from "@/models/Doctor.model";

export async function GET() {
  try {
    await ConnectDB();
    const doctors = await Doctor.find({}, "_id name email specialization").sort(
      { name: 1 }
    );
    return NextResponse.json({ success: true, doctors });
  } catch (error) {
    console.error("Fetch doctor list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}
