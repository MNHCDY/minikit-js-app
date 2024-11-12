import { TwitterApi } from "twitter-api-v2";
import { NextRequest, NextResponse } from "next/server";

// Define types for the follower data
interface Follower {
  id: string;
  name: string;
  username: string;
}

interface UserFollowersV2Response {
  data: Follower[];
  meta?: {
    next_token?: string;
  };
}

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

  console.log("API Key:", process.env.TWITTER_API_KEY);
  console.log("API Secret:", process.env.TWITTER_API_SECRET);
  console.log("Access Token:", process.env.TWITTER_ACCESS_TOKEN);
  console.log("Access Secret:", process.env.TWITTER_ACCESS_SECRET);

  if (!userId || !targetUserId) {
    return NextResponse.json(
      { error: "Missing required userId or targetUserId" },
      { status: 400 }
    );
  }

  try {
    // Fetch followers in a paginated manner
    let follows = false;
    let nextToken: string | undefined = undefined;

    // Paginate through the follower list if necessary
    do {
      // Explicitly type the response as UserFollowersV2Response
      const followersResponse: UserFollowersV2Response =
        await client.v2.followers(targetUserId, {
          pagination_token: nextToken,
        });

      // Check if userId is in the list of followers
      follows = followersResponse.data.some(
        (follower: Follower) => follower.id === userId
      );

      // If user is found, break out of the loop
      if (follows) break;

      // Prepare next token for pagination if available
      nextToken = followersResponse.meta?.next_token;
    } while (nextToken && !follows);

    return NextResponse.json({ follows });
  } catch (error) {
    console.error(
      "Error checking Twitter follow status:",
      (error as Error).message,
      (error as Error).stack
    );
    return NextResponse.json(
      { error: "Failed to check follow status" },
      { status: 500 }
    );
  }
}
