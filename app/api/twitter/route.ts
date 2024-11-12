// app/api/twitter/route.ts

import { TwitterApi } from "twitter-api-v2";

// Define the GET method directly as an export
export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  const targetUserId = url.searchParams.get("targetUserId");

  if (!userId || !targetUserId) {
    return new Response(
      JSON.stringify({ message: "userId and targetUserId are required" }),
      { status: 400 }
    );
  }

  const bearerToken = process.env.TWITTER_BEARER_TOKEN;

  if (!bearerToken) {
    return new Response(
      JSON.stringify({ message: "Twitter Bearer Token missing" }),
      { status: 500 }
    );
  }

  const client = new TwitterApi(bearerToken);

  try {
    const response = await client.v2.following(userId);
    const follows = response.data.some((user) => user.id === targetUserId);
    return new Response(JSON.stringify({ follows }), { status: 200 });
  } catch (error) {
    console.error("Error checking follow status:", error);
    return new Response(
      JSON.stringify({ message: "Error checking follow status" }),
      { status: 500 }
    );
  }
}
