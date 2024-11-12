import { TwitterApi } from "twitter-api-v2";
import { NextApiRequest, NextApiResponse } from "next";

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY as string,
  appSecret: process.env.TWITTER_API_SECRET as string,
  accessToken: process.env.TWITTER_ACCESS_TOKEN as string,
  accessSecret: process.env.TWITTER_ACCESS_SECRET as string,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = Array.isArray(req.query.userId)
    ? req.query.userId[0]
    : req.query.userId;
  const targetUserId = Array.isArray(req.query.targetUserId)
    ? req.query.targetUserId[0]
    : req.query.targetUserId;

  if (!userId || !targetUserId) {
    return res
      .status(400)
      .json({ error: "Missing required userId or targetUserId" });
  }

  try {
    const followers = await client.v2.followers(targetUserId);

    // Check if userId is in the list of followers
    const follows = followers.data.some((follower) => follower.id === userId);

    res.status(200).json({ follows });
  } catch (error) {
    console.error("Error checking Twitter follow status:", error);
    res.status(500).json({ error: "Failed to check follow status" });
  }
}
