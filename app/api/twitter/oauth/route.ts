import { TwitterApi } from "twitter-api-v2";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
  });

  // Generate the auth link with your callback URL
  const { oauth_token, oauth_token_secret } =
    await twitterClient.generateAuthLink(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/twitter/callback`
    );

  // Store oauth_token_secret in cookies
  cookies().set("oauth_token_secret", oauth_token_secret);

  // Redirect the user to Twitter for authentication
  return NextResponse.redirect(
    `https://api.twitter.com/oauth/authorize?oauth_token=${oauth_token}`
  );
}
