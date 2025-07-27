import { ConnectDB } from "@/dbConfig/dbConfig";
import Journal from "@/models/journal.model";
import User from "@/models/user.models";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";

export async function GET() {
  try {
    await ConnectDB();
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const journals = await Journal.find({ userId: user._id }).sort({
      createdAt: -1,
    });
    return NextResponse.json({
      message: "Journals fetched successfully",
      success: true,
      journals,
    });
  } catch (error: any) {
    console.error("Journal fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
