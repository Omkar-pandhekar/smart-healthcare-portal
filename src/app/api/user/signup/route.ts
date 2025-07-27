import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { ConnectDB } from "@/dbConfig/dbConfig";
import User from "@/models/user.models";

export async function POST(request: NextRequest) {
  try {
    await ConnectDB();
    const reqBody = await request.json();
    const { fullname, email, password, username, role } = reqBody;

    // Validate required fields
    if (!fullname || !email || !password || !username || !role) {
      return NextResponse.json(
        {
          error:
            "All fields (fullname, email, password, username, role) are required.",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const user = await User.findOne({ email });
    if (user) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
      username,
      role,
    });

    const savedUser = await newUser.save();
    console.log("User created successfully:", savedUser.email);

    return NextResponse.json({
      message: "User created successfully",
      success: true,
      savedUser,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
