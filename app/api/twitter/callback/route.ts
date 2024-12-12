import { TwitterApi } from "twitter-api-v2";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import supabase from "@/components/Supabase/supabaseClient";
import { authOptions } from "@/app/lib/auth";
import { getServerSession } from "next-auth/next";

// function delay(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/landing-page?error=unauthorized`
    );
  }

  const { searchParams } = new URL(req.url);
  const oauth_token = searchParams.get("oauth_token");
  const oauth_verifier = searchParams.get("oauth_verifier");

  const oauth_token_secret = cookies().get("oauth_token_secret")?.value;

  if (!oauth_token || !oauth_verifier || !oauth_token_secret) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/landing-page?error=invalid_callback`
    );
  }

  try {
    const twitterClient = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: oauth_token,
      accessSecret: oauth_token_secret,
    });

    const { client: loggedClient } = await twitterClient.login(oauth_verifier);
    const user = await loggedClient.v1.verifyCredentials({
      include_email: true,
    });
    // console.log("user", user);

    const { screen_name, id_str: twitterId } = user;

    if (!screen_name) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/landing-page?error=no_screen_name`
      );
    }

    const world_id = session?.user?.name;

    if (!world_id) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/landing-page?error=no_world_id`
      );
    }

    const { data: userRecord, error: fetchError } = await supabase
      .from("users")
      .select("points")
      .eq("world_id", world_id)
      .single();

    if (fetchError) {
      console.error("Error fetching user data:", fetchError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/landing-page?error=fetch_error`
      );
    }

    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("world_id")
      .eq("twitter_id", screen_name)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing twitter_id:", checkError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/landing-page?error=check_error`
      );
    }

    if (existingUser && existingUser.world_id !== world_id) {
      console.warn(
        `Twitter ID ${screen_name} is already linked to another user. Skipping update.`
      );
    } else {
      const currentPoints = userRecord?.points || 0;
      const newPoints = currentPoints + 25;

      const { error: updateError } = await supabase
        .from("users")
        .update({ points: newPoints, twitter_id: screen_name })
        .eq("world_id", world_id);

      if (updateError) {
        console.error("Error updating user data:", updateError);
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/landing-page?error=update_error`
        );
      }
    }

    const targetAccountId = `${process.env.TARGET_TWITTER_ID}`;
    // console.log(targetAccountId);
    try {
      await loggedClient.v1.createFriendship({ user_id: targetAccountId });
      // console.log(`User successfully followed account ${targetAccountId}`);
    } catch (followError) {
      console.warn("Traffic too high. Unable to follow account.");
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/landing-page?error=traffic_high`
      );
    }

    // await delay(5000);
    cookies().delete("oauth_token_secret");

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/landing-page?success=true`
    );
  } catch (error: any) {
    console.error("Error during Twitter callback:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/landing-page?error=callback_error`
    );
  }
}
