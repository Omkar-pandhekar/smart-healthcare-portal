import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import { ConnectDB } from "@/dbConfig/dbConfig";
import Chat from "@/models/Chat.model";
import User from "@/models/user.models";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

  const { id } = await params;

  try {
    const { message } = await req.json();
    const chat = await Chat.findOne({ _id: id, userId: user._id });
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }
    // Add user message
    chat.messages.push({
      sender: "user",
      text: message,
      timestamp: new Date(),
    });
    // Get bot reply
    const botRes = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/chatbot`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      }
    );
    const botData = await botRes.json();
    const botReply = botData.reply || "Sorry, I didn't get that.";
    const voiceSummary = botData.voiceSummary || botReply;
    // Add bot message
    chat.messages.push({
      sender: "bot",
      text: botReply,
      timestamp: new Date(),
    });
    // Update chat title if it's the first message
    if (chat.messages.length === 2) {
      chat.title =
        message.length > 30 ? message.substring(0, 30) + "..." : message;
    }
    await chat.save();
    return NextResponse.json({
      userMessage: chat.messages[chat.messages.length - 2],
      botMessage: chat.messages[chat.messages.length - 1],
      voiceSummary: voiceSummary,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add message" },
      { status: 500 }
    );
  }
}
