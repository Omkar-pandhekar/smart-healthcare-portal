import { NextResponse } from "next/server";
import dbConnect from "../../../../utils/mongodb";
import Doctor from "../../../../models/Doctor.model";

export async function POST(req: Request) {
  await dbConnect;
  try {
    const { doctorId } = await req.json();
    if (!doctorId)
      return NextResponse.json(
        { success: false, error: "Missing doctorId" },
        { status: 400 }
      );
    await Doctor.findByIdAndDelete(doctorId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to delete doctor" },
      { status: 500 }
    );
  }
}
