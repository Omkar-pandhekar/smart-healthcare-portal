import { ConnectDB } from "@/dbConfig/dbConfig";
import Journal from "@/models/journal.model";
import User from "@/models/user.models";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";

export async function POST(request: NextRequest) {
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
    const reqBody = await request.json();
    const { title, content, mood } = reqBody;
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }
    const newJournal = new Journal({
      userId: user._id,
      title,
      content,
      mood,
    });
    const savedJournal = await newJournal.save();
    return NextResponse.json({
      message: "Journal entry saved successfully",
      success: true,
      journal: savedJournal,
    });
  } catch (error: unknown) {
    console.error("Journal submission error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
