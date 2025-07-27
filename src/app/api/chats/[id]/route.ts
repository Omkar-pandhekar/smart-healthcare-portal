import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import { ConnectDB } from "@/dbConfig/dbConfig";
import Chat from "@/models/Chat.model";
import User from "@/models/user.models";

// GET - Fetch specific chat
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await ConnectDB();
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  try {
    const chat = await Chat.findOne({ _id: params.id, userId: user._id });
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }
    return NextResponse.json({ chat });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch chat" },
      { status: 500 }
    );
  }
}

// DELETE - Delete chat
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await ConnectDB();
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  try {
    const chat = await Chat.findOneAndDelete({
      _id: params.id,
      userId: user._id,
    });
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Chat deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete chat" },
      { status: 500 }
    );
  }
}
