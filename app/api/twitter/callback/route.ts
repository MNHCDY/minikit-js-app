// pages/api/twitter/callback.ts
import { TwitterApi } from "twitter-api-v2";
import { getCookie, deleteCookie } from "cookies-next";
import { NextApiRequest, NextApiResponse } from "next";
import supabase from "@/components/Supabase/supabaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code, state } = req.query;
  const codeVerifier = getCookie("codeVerifier", { req, res });
  const storedState = getCookie("state", { req, res });

  // Verify state and codeVerifier
  if (!codeVerifier || !storedState || storedState !== state) {
    return res.status(400).json({ error: "Invalid OAuth request" });
  }

  // Initialize Twitter client for token exchange
  const twitterClient = new TwitterApi({
    clientId: process.env.TWITTER_CLIENT_ID!,
    clientSecret: process.env.TWITTER_CLIENT_SECRET!,
  });

  try {
    // Complete login with Twitter API
    const { client: loggedClient } = await twitterClient.loginWithOAuth2({
      code: code as string,
      codeVerifier: codeVerifier as string,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/twitter/callback`,
    });

    // Fetch authenticated user's info
    const { data: user } = await loggedClient.v2.me();

    // Check if user follows your Twitter account
    const yourTwitterId = "YOUR_TWITTER_USER_ID"; // Replace with your Twitter user ID
    const { data: following } = await loggedClient.v2.following(user.id);

    const isFollowing = following.some(
      (follower) => follower.id === yourTwitterId
    );

    // If user follows, increment points in Supabase
    if (isFollowing) {
      // Step 1: Fetch current points
      const { data: userRecord, error: fetchError } = await supabase
        .from("users")
        .select("points")
        .eq("world_id", user.id)
        .single();

      if (fetchError) throw fetchError;

      // Step 2: Increment points by 10
      const newPoints = (userRecord?.points || 0) + 10;

      // Step 3: Update points in Supabase
      const { error: updateError } = await supabase
        .from("users")
        .update({ points: newPoints })
        .eq("world_id", user.id);

      if (updateError) throw updateError;

      // Clear cookies after successful verification
      deleteCookie("codeVerifier", { req, res });
      deleteCookie("state", { req, res });

      return res.json({
        success: true,
        message: "Points added for following on Twitter!",
      });
    } else {
      return res.json({
        success: false,
        message: "User is not following on Twitter.",
      });
    }
  } catch (error) {
    console.error("Twitter callback error:", error);
    res.status(500).json({ error: "Failed to authenticate with Twitter" });
  }
}
