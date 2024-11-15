import { TwitterApi } from "twitter-api-v2";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
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
    const {
      client: loggedClient,
      accessToken,
      accessSecret,
    } = await twitterClient.login(oauth_verifier);
    console.log("logged client", loggedClient);
    // Fetch authenticated user's details
    const user = await loggedClient.v1.verifyCredentials({
      include_email: true,
    });

    console.log("User data:", user);

    console.log("Oauth token:", oauth_token);
    console.log("Oauth verifier:", oauth_verifier);
    console.log("Oauth token secret:", oauth_token_secret);

    // Process the user's information (e.g., update database)
    // Add logic to check followers, add points, etc.

    // Clear cookies
    cookies().delete("oauth_token_secret");

    return NextResponse.json({
      success: true,
      message: "Authenticated successfully!",
      user,
    });
  } catch (error: any) {
    console.error("Error during Twitter callback:", error);
    return NextResponse.json(
      { error: `Failed to authenticate: ${error.message}` },
      { status: 500 }
    );
  }
}
