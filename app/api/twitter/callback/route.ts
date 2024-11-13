// app/api/twitter/callback/route.ts
import { TwitterApi } from "twitter-api-v2";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import supabase from "@/components/Supabase/supabaseClient";

const CALLBACK_URL = `${process.env.NEXT_PUBLIC_APP_URL}/api/twitter/callback`;
const YOUR_TWITTER_USER_ID = "mnhcdy"; // Replace with your Twitter user ID

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  // Retrieve cookies using Next.js `cookies` API
  const codeVerifier = cookies().get("codeVerifier")?.value;
  const storedState = cookies().get("state")?.value;

  // Verify state and codeVerifier
  if (!codeVerifier || !storedState || storedState !== state) {
    return NextResponse.json(
      { error: "Invalid OAuth request: state or codeVerifier mismatch" },
      { status: 400 }
    );
  }

  // Initialize Twitter client for token exchange
  const twitterClient = new TwitterApi({
    clientId: process.env.TWITTER_CLIENT_ID!,
    clientSecret: process.env.TWITTER_CLIENT_SECRET!,
  });

  try {
    // Complete OAuth2 login
    const { client: loggedClient } = await twitterClient.loginWithOAuth2({
      code: code as string,
      codeVerifier: codeVerifier as string,
      redirectUri: CALLBACK_URL,
    });

    // Fetch authenticated user's info
    const { data: user } = await loggedClient.v2.me();

    // Check if user follows your Twitter account
    const { data: following } = await loggedClient.v2.following(user.id);
    const isFollowing = following.some(
      (followed) => followed.id === YOUR_TWITTER_USER_ID
    );

    // If user follows, increment points in Supabase
    if (isFollowing) {
      // Fetch current points
      const { data: userRecord, error: fetchError } = await supabase
        .from("users")
        .select("points")
        .eq("world_id", user.id)
        .single();

      if (fetchError)
        throw new Error(`Failed to fetch user points: ${fetchError.message}`);

      // Increment points by 10
      const newPoints = (userRecord?.points || 0) + 25;

      // Update points in Supabase
      const { error: updateError } = await supabase
        .from("users")
        .update({ points: newPoints })
        .eq("world_id", user.id);

      if (updateError)
        throw new Error(`Failed to update user points: ${updateError.message}`);

      // Clear cookies after successful verification
      cookies().delete("codeVerifier");
      cookies().delete("state");

      return NextResponse.json({
        success: true,
        message: "Points added for following on Twitter!",
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "User is not following on Twitter.",
      });
    }
  } catch (error) {
    console.error("Twitter callback error:", error);
    return NextResponse.json(
      {
        error: `Failed to authenticate with Twitter: ${
          (error as Error).message
        }`,
      },
      { status: 500 }
    );
  }
}
