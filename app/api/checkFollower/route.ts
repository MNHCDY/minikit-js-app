import axios from "axios";

const bearerToken = process.env.TWITTER_BEARER_TOKEN;
const yourTwitterId = process.env.TARGET_TWITTER_ID;

export async function POST(req: Request) {
  try {
    const { twitterHandle } = await req.json();

    if (!twitterHandle) {
      return new Response(
        JSON.stringify({ error: "Twitter handle is required" }),
        { status: 400 }
      );
    }

    const sanitizedHandle = twitterHandle.replace("@", "").trim();

    // Fetch user ID for the entered Twitter handle
    const userResponse = await axios.get(
      `https://api.twitter.com/2/users/by/username/${sanitizedHandle}`,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    );

    const userId = userResponse.data.data?.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    // Fetch followers list
    const followingResponse = await axios.get(
      `https://api.twitter.com/2/users/${yourTwitterId}/followers`,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
        params: {
          max_results: 1000,
        },
      }
    );

    const followers = followingResponse.data.data || [];
    const isFollowing = followers.some((user: any) => user.id === userId);

    return new Response(JSON.stringify({ isFollowing }), { status: 200 });
  } catch (error: any) {
    console.error("Error in API route:", {
      message: error.message,
      response: error.response?.data,
    });
    return new Response(
      JSON.stringify({ error: "Failed to check follower status" }),
      { status: 500 }
    );
  }
}
