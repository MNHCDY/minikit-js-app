// pages/api/twitter/oauth.ts
import { TwitterApi } from "twitter-api-v2";
import { setCookie } from "cookies-next";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const twitterClient = new TwitterApi({
    clientId: process.env.TWITTER_CLIENT_ID!,
    clientSecret: process.env.TWITTER_CLIENT_SECRET!,
  });

  const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/twitter/callback`,
    { scope: ["tweet.read", "users.read", "follows.read"] }
  );

  // Store codeVerifier and state in cookies for verification upon callback
  setCookie("codeVerifier", codeVerifier, { req, res });
  setCookie("state", state, { req, res });

  res.redirect(url);
}
