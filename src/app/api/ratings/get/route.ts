import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "../../../../dbConfig/dbConfig";
import Rating from "../../../../models/Rating.model";
import User from "../../../../models/user.models";

export async function GET(request: NextRequest) {
  await ConnectDB();

  try {
    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get("targetType");
    const targetId = searchParams.get("targetId");
    const userId = searchParams.get("userId");

    if (!targetType || !targetId) {
      return NextResponse.json(
        { success: false, error: "Missing targetType or targetId" },
        { status: 400 }
      );
    }

    if (targetType !== "doctor" && targetType !== "hospital") {
      return NextResponse.json(
        { success: false, error: "Invalid target type" },
        { status: 400 }
      );
    }

    // Get all ratings for the target
    const ratings = await Rating.find({ targetType, targetId }).sort({
      createdAt: -1,
    });

    // Calculate average rating
    const totalRatings = ratings.length;
    const averageRating =
      totalRatings > 0
        ? Math.round(
            (ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings) * 10
          ) / 10
        : 0;

    // Get user's rating if userId is provided
    let userRating = null;
    if (userId) {
      userRating = await Rating.findOne({ userId, targetType, targetId });
    }

    return NextResponse.json({
      success: true,
      ratings,
      averageRating,
      totalRatings,
      userRating,
    });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    console.error("Error details:", {
      targetType,
      targetId,
      userId,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      errorStack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { success: false, error: "Failed to fetch ratings" },
      { status: 500 }
    );
  }
}
