import { NextResponse } from "next/server";
import dbConnect from "../../../../utils/mongodb";
import Hospital from "../../../../models/hospital.model";

export async function GET() {
  await dbConnect;
  try {
    const hospitals = await Hospital.find(
      {},
      {
        _id: 1,
        name: 1,
        address: 1,
        phone: 1,
        email: 1,
        website: 1,
        images: 1,
      }
    );
    return NextResponse.json({ success: true, hospitals });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch hospitals" },
      { status: 500 }
    );
  }
}
