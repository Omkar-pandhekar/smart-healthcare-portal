import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import { ConnectDB } from "@/dbConfig/dbConfig";
import Mood from "@/models/Mood.model";
import journal from "@/models/journal.model";
import Chat from "@/models/Chat.model";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ConnectDB();

    // Get user email from session
    const userEmail = session.user.email;

    // Fetch mood entries count
    const moodCount = await Mood.countDocuments({ userEmail });

    // Fetch journal posts count
    const journalCount = await journal.countDocuments({ userEmail });

    // Fetch chat sessions count
    const chatCount = await Chat.countDocuments({ userEmail });

    // Calculate wellness score based on recent mood entries
    let wellnessScore = 85; // Default score

    if (moodCount > 0) {
      // Get recent mood entries (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentMoods = await Mood.find({
        userEmail,
        createdAt: { $gte: thirtyDaysAgo },
      }).sort({ createdAt: -1 });

      if (recentMoods.length > 0) {
        // Calculate average mood score
        const moodScores = recentMoods.map((mood) => {
          const moodValue = mood.mood;
          // Convert mood string to numeric score (1-10)
          const moodScoreMap: { [key: string]: number } = {
            "very-happy": 10,
            happy: 8,
            neutral: 6,
            sad: 4,
            "very-sad": 2,
            anxious: 3,
            stressed: 3,
            excited: 9,
            calm: 7,
            angry: 2,
            frustrated: 3,
            grateful: 9,
            hopeful: 8,
            tired: 4,
            energetic: 8,
          };
          return moodScoreMap[moodValue] || 5;
        });

        const averageScore =
          moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length;
        wellnessScore = Math.round((averageScore / 10) * 100);
      }
    }

    return NextResponse.json({
      moodEntries: moodCount,
      journalPosts: journalCount,
      chatSessions: chatCount,
      wellnessScore: wellnessScore,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user statistics" },
      { status: 500 }
    );
  }
}
