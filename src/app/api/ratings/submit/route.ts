import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "../../../../dbConfig/dbConfig";
import Rating from "../../../../models/Rating.model";
import Doctor from "../../../../models/Doctor.model";
import Hospital from "../../../../models/hospital.model";
import User from "../../../../models/user.models";

export async function POST(request: NextRequest) {
  await ConnectDB();

  try {
    const { userId, targetType, targetId, rating, review } =
      await request.json();

    // Validate input
    if (!userId || !targetType || !targetId || !rating) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (targetType !== "doctor" && targetType !== "hospital") {
      return NextResponse.json(
        { success: false, error: "Invalid target type" },
        { status: 400 }
      );
    }

    // Check if target exists
    let target;
    if (targetType === "doctor") {
      target = await Doctor.findById(targetId);
    } else {
      target = await Hospital.findById(targetId);
    }

    if (!target) {
      return NextResponse.json(
        { success: false, error: `${targetType} not found` },
        { status: 404 }
      );
    }

    // Use findOneAndUpdate to either create or update the rating
    const ratingDoc = await Rating.findOneAndUpdate(
      { userId, targetType, targetId },
      { rating, review },
      { upsert: true, new: true }
    );

    // Calculate new average rating
    const allRatings = await Rating.find({ targetType, targetId });
    const totalRatings = allRatings.length;
    const averageRating =
      allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

    // Update target's average rating
    if (targetType === "doctor") {
      await Doctor.findByIdAndUpdate(targetId, {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalRatings,
      });
    } else {
      await Hospital.findByIdAndUpdate(targetId, {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalRatings,
      });
    }

    return NextResponse.json({
      success: true,
      rating: ratingDoc,
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings,
    });
  } catch (error) {
    console.error("Error submitting rating:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit rating" },
      { status: 500 }
    );
  }
}
