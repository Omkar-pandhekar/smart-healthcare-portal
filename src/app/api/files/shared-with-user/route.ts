import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "@/dbConfig/dbConfig";
import FileModel from "@/models/File.model";

export async function GET(request: NextRequest) {
  try {
    await ConnectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Find files where the user is in the sharedWith array
    const sharedFiles = await FileModel.find({
      sharedWith: { $in: [userId] },
    })
      .populate("owner", "fullname email")
      .populate("doctor", "name email");

    return NextResponse.json({
      success: true,
      files: sharedFiles,
      count: sharedFiles.length,
    });
  } catch (error) {
    console.error("Error fetching shared files:", error);
    return NextResponse.json(
      { error: "Failed to fetch shared files" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ConnectDB();

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Find files where the user is in the sharedWith array
    const sharedFiles = await FileModel.find({
      sharedWith: { $in: [userId] },
    })
      .populate("owner", "fullname email")
      .populate("doctor", "name email");

    return NextResponse.json({
      success: true,
      files: sharedFiles,
      count: sharedFiles.length,
    });
  } catch (error) {
    console.error("Error fetching shared files:", error);
    return NextResponse.json(
      { error: "Failed to fetch shared files" },
      { status: 500 }
    );
  }
}
