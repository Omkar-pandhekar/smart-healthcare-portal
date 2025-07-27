import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ConnectDB } from "../../../../dbConfig/dbConfig";
import User from "../../../../models/user.models";
import { authOptions } from "../../../../utils/authOptions";

export async function GET(request: NextRequest) {
  try {
    await ConnectDB();

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Fetch all users (patients)
    const users = await User.find({}, { fullname: 1, email: 1, _id: 1 }).sort({
      fullname: 1,
    });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Fetch users error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
