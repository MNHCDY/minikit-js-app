// pages/api/twitter.js

import { NextApiRequest, NextApiResponse } from "next"; // Import types for the request and response
import { TwitterApi } from "twitter-api-v2";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Only GET requests allowed" });
  }

  // Ensure userId and targetUserId are strings (or return an error if not)
  const userId = Array.isArray(req.query.userId)
    ? req.query.userId[0]
    : req.query.userId;
  const targetUserId = Array.isArray(req.query.targetUserId)
    ? req.query.targetUserId[0]
    : req.query.targetUserId;

  if (!userId || !targetUserId) {
    return res
      .status(400)
      .json({ message: "userId and targetUserId are required" });
  }

  const bearerToken = process.env.TWITTER_BEARER_TOKEN;

  if (!bearerToken) {
    return res.status(500).json({ message: "Twitter Bearer Token missing" });
  }

  const client = new TwitterApi(bearerToken);

  try {
    const response = await client.v2.following(userId);
    const follows = response.data.some((user) => user.id === targetUserId);
    return res.status(200).json({ follows });
  } catch (error) {
    console.error("Error checking follow status:", error);
    return res.status(500).json({ message: "Error checking follow status" });
  }
}
