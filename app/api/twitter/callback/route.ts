// pages/api/twitter/callback.ts
import { TwitterApi } from "twitter-api-v2";
import { getCookie, deleteCookie } from "cookies-next";
import { NextApiRequest, NextApiResponse } from "next";
import supabase from "@/components/Supabase/supabaseClient";

const CALLBACK_URL = `${process.env.NEXT_PUBLIC_APP_URL}/api/twitter/callback`;
const YOUR_TWITTER_USER_ID = "YOUR_TWITTER_USER_ID"; // Replace with your Twitter user ID

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code, state } = req.query;
  const codeVerifier = getCookie("codeVerifier", { req, res });
  const storedState = getCookie("state", { req, res });

  // Verify state and codeVerifier
  if (!codeVerifier || !storedState || storedState !== state) {
    return res
      .status(400)
      .json({ error: "Invalid OAuth request: state or codeVerifier mismatch" });
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
      const newPoints = (userRecord?.points || 0) + 10;

      // Update points in Supabase
      const { error: updateError } = await supabase
        .from("users")
        .update({ points: newPoints })
        .eq("world_id", user.id);

      if (updateError)
        throw new Error(`Failed to update user points: ${updateError.message}`);

      // Clear cookies after successful verification
      deleteCookie("codeVerifier", { req, res });
      deleteCookie("state", { req, res });

      return res
        .status(200)
        .json({
          success: true,
          message: "Points added for following on Twitter!",
        });
    } else {
      return res
        .status(200)
        .json({ success: false, message: "User is not following on Twitter." });
    }
  } catch (error) {
    console.error("Twitter callback error:", error);
    return res
      .status(500)
      .json({
        error: `Failed to authenticate with Twitter: ${
          (error as Error).message
        }`,
      });
  }
}
