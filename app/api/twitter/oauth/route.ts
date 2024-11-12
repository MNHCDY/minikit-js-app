// app/api/twitter/oauth/route.ts
import { TwitterApi } from "twitter-api-v2";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const CALLBACK_URL = `${process.env.NEXT_PUBLIC_APP_URL}/api/twitter/callback`;

export async function GET() {
  const twitterClient = new TwitterApi({
    clientId: process.env.TWITTER_CLIENT_ID!,
    clientSecret: process.env.TWITTER_CLIENT_SECRET!,
  });

  const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
    CALLBACK_URL,
    { scope: ["tweet.read", "users.read", "follows.read"] }
  );

  // Store codeVerifier and state in cookies for verification upon callback
  cookies().set("codeVerifier", codeVerifier);
  cookies().set("state", state);

  return NextResponse.redirect(url);
}
