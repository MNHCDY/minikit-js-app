import { TwitterApi } from "twitter-api-v2";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import supabase from "@/components/Supabase/supabaseClient";
import { authOptions } from "@/app/lib/auth";
import { getServerSession } from "next-auth/next";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const oauth_token = searchParams.get("oauth_token");
  const oauth_verifier = searchParams.get("oauth_verifier");

  // Retrieve oauth_token_secret from cookies
  const oauth_token_secret = cookies().get("oauth_token_secret")?.value;

  if (!oauth_token || !oauth_verifier || !oauth_token_secret) {
    return NextResponse.json(
      { error: "Invalid OAuth callback request" },
      { status: 400 }
    );
  }

  try {
    const twitterClient = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: oauth_token,
      accessSecret: oauth_token_secret,
    });

    // Obtain the access token and secret
    const { client: loggedClient } = await twitterClient.login(oauth_verifier);

    // Fetch authenticated user's details
    const user = await loggedClient.v1.verifyCredentials({
      include_email: true,
    });
    console.log("user", user);

    const { screen_name, id_str: twitterId } = user;

    if (!screen_name) {
      return NextResponse.json(
        { error: "Failed to retrieve screen_name from Twitter." },
        { status: 400 }
      );
    }

    const world_id = session?.user?.name;

    if (!world_id) {
      return NextResponse.json(
        { error: "world_id not found in session" },
        { status: 400 }
      );
    }

    // Fetch user's current points from Supabase
    const { data: userRecord, error: fetchError } = await supabase
      .from("users")
      .select("points")
      .eq("world_id", world_id)
      .single();

    if (fetchError) {
      console.error("Error fetching user data:", fetchError);
      throw new Error(`Failed to fetch user data: ${fetchError.message}`);
    }

    // Check if the twitter_id already exists for a different user
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("world_id")
      .eq("twitter_id", screen_name)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing twitter_id:", checkError);
      throw new Error(
        `Failed to check existing twitter_id: ${checkError.message}`
      );
    }

    if (existingUser && existingUser.world_id !== world_id) {
      return NextResponse.json(
        {
          error: `Twitter ID ${screen_name} is already linked to another user. Please try different  Twitter ID`,
        },
        { status: 400 }
      );
    } else {
      // Calculate new points
      const currentPoints = userRecord?.points || 0;
      const newPoints = currentPoints + 25;

      // Update user's points and twitter_id in Supabase
      const { error: updateError } = await supabase
        .from("users")
        .update({ points: newPoints, twitter_id: screen_name })
        .eq("world_id", world_id);

      if (updateError) {
        console.error("Error updating user data:", updateError);
        throw new Error(`Failed to update user data: ${updateError.message}`);
      }
    }

    // Follow your account automatically
    const targetAccountId = `${process.env.TARGET_TWITTER_ID}`;
    console.log(targetAccountId); // Replace with your Twitter account ID
    try {
      await loggedClient.v1.createFriendship({ user_id: targetAccountId });
      console.log(`User successfully followed account ${targetAccountId}`);
    } catch (followError) {
      return NextResponse.json(
        {
          error: "Failed to follow account. Please try again after some time.",
        },
        { status: 400 }
      );
    }

    // Clear cookies
    cookies().delete("oauth_token_secret");

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/reward-page`
    );
  } catch (error: any) {
    console.error("Error during Twitter callback:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/reward-page`
    );
  }
}
