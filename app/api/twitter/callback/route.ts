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
    console.log(user);
    const { screen_name } = user;

    if (!screen_name) {
      return NextResponse.json(
        { error: "Failed to retrieve screen_name from Twitter." },
        { status: 400 }
      );
    }

    // const world_id = session?.user?.name;

    // if (!world_id) {
    //   return NextResponse.json(
    //     { error: "world_id not found in session" },
    //     { status: 400 }
    //   );
    // }

    // Fetch user's current points from Supabase
    // const { data: userRecord, error: fetchError } = await supabase
    //   .from("users")
    //   .select("points")
    //   .eq("world_id", world_id)
    //   .single();

    // if (fetchError) {
    //   console.error("Error fetching user data:", fetchError);
    //   throw new Error(`Failed to fetch user data: ${fetchError.message}`);
    // }

    // Calculate new points
    // const currentPoints = userRecord?.points || 0;
    // const newPoints = currentPoints + 25;

    // Update user's points and twitter_id in Supabase
    // const { error: updateError } = await supabase
    //   .from("users")
    //   .update({ points: newPoints, twitter_id: screen_name })
    //   .eq("world_id", world_id);

    // if (updateError) {
    //   console.error("Error updating user data:", updateError);
    //   throw new Error(`Failed to update user data: ${updateError.message}`);
    // }

    // const twitterAccountIdToFollow = "mnhcdy"; // Replace with your Twitter account ID
    // const id = "895315062864269314";

    try {
      // Follow the target account with the logged user's ID
      // await loggedClient.v2.follow(id, twitterAccountIdToFollow);
    } catch (followError) {
      console.error("Error following Twitter account:", followError);
      return NextResponse.json(
        { error: "Failed to follow the specified Twitter account" },
        { status: 500 }
      );
    }

    // Clear cookies
    cookies().delete("oauth_token_secret");

    return NextResponse.toString();
  } catch (error: any) {
    console.error("Error during Twitter callback:", error);
    return NextResponse.json(
      { error: `Failed to authenticate: ${error.message}` },
      { status: 500 }
    );
  }
}
