import { TwitterApi } from "twitter-api-v2";
import { NextRequest, NextResponse } from "next/server";

// Initialize Twitter client
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY as string,
  appSecret: process.env.TWITTER_API_SECRET as string,
  accessToken: process.env.TWITTER_ACCESS_TOKEN as string,
  accessSecret: process.env.TWITTER_ACCESS_SECRET as string,
});

// Define GET function to handle requests
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const targetUserId = searchParams.get("targetUserId");

  if (!userId || !targetUserId) {
    return NextResponse.json(
      { error: "Missing required userId or targetUserId" },
      { status: 400 }
    );
  }

  try {
    const followers = await client.v2.followers(targetUserId);

    // Check if userId is in the list of followers
    const follows = followers.data.some((follower) => follower.id === userId);

    return NextResponse.json({ follows });
  } catch (error) {
    console.error("Error checking Twitter follow status:", error);
    return NextResponse.json(
      { error: "Failed to check follow status" },
      { status: 500 }
    );
  }
}
