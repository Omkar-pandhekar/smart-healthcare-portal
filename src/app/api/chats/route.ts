import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import { ConnectDB } from "@/dbConfig/dbConfig";
import Chat from "@/models/Chat.model";
import User from "@/models/user.models";

// GET - Fetch user's chat history
export async function GET(req: NextRequest) {
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
    const chats = await Chat.find({ userId: user._id })
      .select("title createdAt updatedAt messages")
      .sort({ updatedAt: -1 });
    return NextResponse.json({ chats });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}

// POST - Create a new chat
export async function POST(req: NextRequest) {
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
    const { title, initialMessage } = await req.json();
    const newChat = new Chat({
      userId: user._id,
      title: title || "New Chat",
      messages: initialMessage
        ? [
            {
              sender: "user",
              text: initialMessage,
              timestamp: new Date(),
            },
            {
              sender: "bot",
              text: "Hi! How can I help you today?",
              timestamp: new Date(),
            },
          ]
        : [],
    });
    const savedChat = await newChat.save();
    return NextResponse.json({ chat: savedChat });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    );
  }
}
