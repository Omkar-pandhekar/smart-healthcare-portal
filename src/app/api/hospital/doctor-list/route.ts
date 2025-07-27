import { NextResponse } from "next/server";
import dbConnect from "../../../../utils/mongodb";
import Doctor from "../../../../models/Doctor.model";

export async function GET(req) {
  await dbConnect;
  const url = new URL(req.url);
  const hospitalId = url.searchParams.get("hospitalId");
  if (!hospitalId) {
    return NextResponse.json(
      { success: false, error: "Missing hospitalId" },
      { status: 400 }
    );
  }
  try {
    const doctors = await Doctor.find(
      { hospital: hospitalId },
      {
        _id: 1,
        name: 1,
        email: 1,
        specialization: 1,
        verificationStatus: 1,
      }
    );
    return NextResponse.json({ success: true, doctors });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}
