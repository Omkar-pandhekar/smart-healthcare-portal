import { NextResponse } from "next/server";
import { ConnectDB } from "../../../../dbConfig/dbConfig";
import Hospital from "../../../../models/hospital.model";

export async function GET() {
  await ConnectDB();
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
        averageRating: 1,
        totalRatings: 1,
      }
    );
    return NextResponse.json({ success: true, hospitals });
  } catch (error) {
    console.error("Error fetching hospitals:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch hospitals" },
      { status: 500 }
    );
  }
}
