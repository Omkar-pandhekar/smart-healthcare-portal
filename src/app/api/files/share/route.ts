import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ConnectDB } from "../../../../dbConfig/dbConfig";
import FileModel from "../../../../models/File.model";
import User from "../../../../models/user.models";
import { authOptions } from "../../../../utils/authOptions";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { fileId, email } = body;

    if (!fileId || !email) {
      return NextResponse.json(
        { success: false, error: "File ID and email are required" },
        { status: 400 }
      );
    }

    // Find the user to share with
    const targetUser = await User.findOne({ email });
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Find the file
    const file = await FileModel.findById(fileId);
    if (!file) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    // Check if the current user owns the file
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Current user not found" },
        { status: 404 }
      );
    }

    if (file.owner.toString() !== currentUser._id.toString()) {
      return NextResponse.json(
        { success: false, error: "You can only share files you own" },
        { status: 403 }
      );
    }

    // Check if file is already shared with this user
    if (file.sharedWith.includes(targetUser._id.toString())) {
      return NextResponse.json(
        { success: false, error: "File is already shared with this user" },
        { status: 400 }
      );
    }

    // Share the file
    file.sharedWith.push(targetUser._id.toString());
    await file.save();

    return NextResponse.json({
      success: true,
      message: "File shared successfully",
    });
  } catch (error) {
    console.error("Error sharing file:", error);
    return NextResponse.json(
      { success: false, error: "Failed to share file" },
      { status: 500 }
    );
  }
}
