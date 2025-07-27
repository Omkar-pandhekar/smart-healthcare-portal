import { ConnectDB } from "@/dbConfig/dbConfig";
import User from "@/models/user.models";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Connect to database first
    await ConnectDB();

    const reqBody = await request.json();
    const { email } = reqBody;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const findUser = await User.findOne({ email });

    if (!findUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Exclude password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = findUser.toObject();

    return NextResponse.json({
      message: "User info fetched successfully",
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("User Fetch API error:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
