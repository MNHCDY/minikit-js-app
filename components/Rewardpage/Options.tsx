"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import supabase from "../Supabase/supabaseClient";
import { useSession } from "next-auth/react";
import { TwitterApi } from "twitter-api-v2";

async function checkIfUserFollows(
  userId: string,
  targetUserId: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `/api/twitter?userId=${userId}&targetUserId=${targetUserId}`
    );
    if (!response.ok) {
      throw new Error("Failed to check follow status");
    }

    const data = await response.json();
    return data.follows;
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
}

type TaskType = "email" | "worldID" | "twitter" | "purchase";

const Options = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isEmailRegistered, setIsEmailRegistered] = useState(false);
  const [clickedTasks, setClickedTasks] = useState<{
    email: boolean;
    twitter: boolean;
    purchase: boolean;
  }>({
    email: false,
    twitter: false,
    purchase: false,
  });

  const handleFollow = () => {
    window.location.href = `/api/twitter/oauth`;
  };

  useEffect(() => {
    const fetchTaskCompletionStatus = async () => {
      try {
        const worldId = session?.user?.name;
        const { data, error } = await supabase
          .from("users")
          .select("email, twitter_id, purchase_completed")
          .eq("world_id", worldId)
          .single();

        if (error) throw error;

        if (data) {
          setClickedTasks({
            email: !!data.email, // Set to true if email exists
            twitter: !!data.twitter_id, // Set to true if twitter_id exists
            purchase: data.purchase_completed,
          });
          setIsEmailRegistered(!!data.email); // Set to true if email exists
        }
      } catch (error) {
        console.error(
          "Error fetching task completion status:",
          (error as Error).message
        );
      }
    };

    if (session) {
      fetchTaskCompletionStatus();
    }
  }, [session]);

  const handleClick = async (task: TaskType) => {
    if (!isEmailRegistered && task !== "email") return;

    const updatedClickedTasks = { ...clickedTasks, [task]: true };
    setClickedTasks(updatedClickedTasks);

    try {
      const worldId = session?.user?.name;

      // Use a more flexible type for updateData
      const updateData: Record<string, any> = {
        purchase_completed: updatedClickedTasks.purchase,
      };

      // Conditionally add email and twitter_id if they are completed
      if (updatedClickedTasks.email) updateData.email = session?.user?.email;
      if (updatedClickedTasks.twitter)
        updateData.twitter_id = "twitter_user_id"; // Replace as needed

      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("world_id", worldId);

      if (error) throw error;

      if (task === "email") {
        setIsEmailRegistered(true);
      }

      if (task === "twitter") {
        window.open("https://x.com/mnhcdy", "_blank");
        const { data: pointsData, error: pointsError } = await supabase
          .from("users")
          .update({ points: 20 })
          .eq("world_id", worldId);

        if (pointsError) {
          console.error(
            "Error updating points in Supabase:",
            pointsError.message
          );
        } else {
          console.log("Points updated successfully:", pointsData);
        }
      }

      switch (task) {
        case "email":
          router.push("/enter-email");
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error updating task completion in Supabase:", error);
    }
  };
  const handlePurchaseClick = () => {
    window.open(
      "https://drinkflojo.com/checkouts/cn/Z2NwLXVzLXdlc3QxOjAxSkNGQlRaUTlYNUtUM1haRlBZMENKQUY3?discount=",
      "_blank"
    );

    pollForPurchaseSuccess();
  };

  const pollForPurchaseSuccess = async () => {
    const userId = session?.user?.name; // Replace with the unique identifier for the user

    // Poll every 5 seconds for up to 1 minute to check if the purchase was successful
    const maxRetries = 20;
    let retries = 0;
    const interval = setInterval(async () => {
      retries++;

      const { data, error } = await supabase
        .from("users")
        .select("purchase_completed")
        .eq("world_id", userId)
        .single();

      if (error) {
        console.error("Error checking purchase status:", error);
        clearInterval(interval);
        return;
      }

      if (data?.purchase_completed) {
        clearInterval(interval);
        await updatePoints(40); // Update with 40 points on successful purchase
        setClickedTasks((prev) => ({ ...prev, purchase: true }));
        console.log("Purchase detected and points updated.");
      } else if (retries >= maxRetries) {
        clearInterval(interval);
        console.log("Purchase not detected within the timeout period.");
      }
    }, 5000); // Poll every 5 seconds
  };

  const updatePoints = async (points: number) => {
    const userId = session?.user?.name;

    try {
      // Step 1: Fetch the current points
      const { data: userData, error: fetchError } = await supabase
        .from("users")
        .select("points")
        .eq("world_id", userId)
        .single();

      if (fetchError) throw fetchError;

      // Step 2: Calculate the new points total
      const currentPoints = userData?.points || 0;
      const newPoints = currentPoints + 40;

      // Step 3: Update the points in the database
      const { error: updateError } = await supabase
        .from("users")
        .update({ points: newPoints })
        .eq("world_id", userId);

      if (updateError) {
        console.error(
          "Error updating points in Supabase:",
          updateError.message
        );
      } else {
        console.log("Points updated successfully.");
      }
    } catch (error) {
      console.error("Error in updatePoints function:", error);
    }
  };

  // const handleClickTwitter = async () => {
  //   const twitterUserId = "Manish27111"; // Replace with Twitter user ID from session data
  //   const yourTwitterId = "mnhcdy"; // Replace with your Twitter account ID

  //   // Redirect to Twitter
  //   window.open("https://twitter.com/mnhcdy", "_blank");

  //   let retries = 0;
  //   const maxRetries = 12;
  //   const interval = setInterval(async () => {
  //     retries += 1;

  //     try {
  //       const response = await fetch(
  //         `/api/checkTwitterFollow?userId=${encodeURIComponent(
  //           twitterUserId
  //         )}&targetUserId=${encodeURIComponent(yourTwitterId)}`
  //       );

  //       // Check if the response is OK before parsing
  //       if (!response.ok) {
  //         throw new Error(`Failed to fetch data: ${response.statusText}`);
  //       }

  //       const { follows } = await response.json();

  //       if (follows) {
  //         clearInterval(interval);

  //         // Step 1: Fetch current points
  //         const userId = session?.user?.name;
  //         const { data: userData, error: fetchError } = await supabase
  //           .from("users")
  //           .select("points")
  //           .eq("world_id", userId)
  //           .single();

  //         if (fetchError) {
  //           console.error("Error fetching points:", fetchError.message);
  //           return;
  //         }

  //         // Step 2: Calculate new points total
  //         const currentPoints = userData?.points || 0;
  //         const newPoints = currentPoints + 40;

  //         // Step 3: Update points in the database
  //         const { error: updateError } = await supabase
  //           .from("users")
  //           .update({ points: newPoints })
  //           .eq("world_id", userId);

  //         if (updateError) {
  //           console.error(
  //             "Error updating points in Supabase:",
  //             updateError.message
  //           );
  //         } else {
  //           console.log("Points updated successfully.");
  //           setClickedTasks((prev) => ({ ...prev, twitter: true }));
  //         }
  //       } else if (retries >= maxRetries) {
  //         clearInterval(interval);
  //         console.log("Follow check timed out.");
  //       }
  //     } catch (error) {
  //       // Type guard to check if the error is an instance of Error
  //       if (error instanceof Error) {
  //         console.error("Error checking follow status:", error.message);
  //       } else {
  //         console.error("An unknown error occurred:", error);
  //       }
  //       clearInterval(interval);
  //     }
  //   }, 5000); // Poll every 5 seconds
  // };

  return (
    <div className="flex flex-col justify-items-center w-full text-[#07494E] gap-[8vw]">
      <div className="p-[5vw] flex flex-col gap-[4vw]">
        <div>
          <button
            onClick={() => router.push("/landing-page")}
            className="text-[10vw] font-extralight"
          >
            <FaArrowLeft />
          </button>
        </div>
        <div>
          <h1 className="text-[10vw] font-bold leading-[8vw] p-[4vw] bg-white/40 backdrop-blur-sm mr-[1vw] rounded-xl">
            FLOJO POINTS{" "}
            <span className="text-[5vw] font-normal">
              Rewards your productivity
            </span>
          </h1>
        </div>
      </div>
      <div>
        <div className="flex flex-col space-y-[5.2vw] p-[4vw] bg-transparent max-w-md mx-auto text-[4vw]">
          {/* Email Task */}
          <div
            onClick={() => handleClick("email")}
            className="flex items-center justify-between px-[3vw] py-[4.2vw] border-2 rounded-xl cursor-pointer border-[#07494E] bg-white"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-5 h-5 rounded-full border-2 border-[#07494E] flex items-center justify-center ${
                  clickedTasks.email ? "bg-[#07494E]" : "bg-transparent"
                }`}
              ></div>
              <span className="text-[#07494E] font-medium">
                Enter your email address
              </span>
            </div>
            <span className="text-[#07494E] font-bold text-[5vw] pr-[3.5vw]">
              +1 pt
            </span>
          </div>

          {/* Twitter Task */}
          <div
            onClick={() => {
              handleClick("twitter");
              handleFollow();
            }}
            className={`flex items-center justify-between px-[3vw] py-[4.2vw] border-2 rounded-xl cursor-pointer border-[#07494E] bg-white ${
              !isEmailRegistered ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-5 h-5 rounded-full border-2 border-[#07494E] flex items-center justify-center ${
                  clickedTasks.twitter ? "bg-[#07494E]" : "bg-transparent"
                }`}
              ></div>
              <span className="text-[#07494E] font-medium">
                Follow us on Twitter
              </span>
            </div>
            <span className="text-[#07494E] font-bold text-[5vw]">+25 pt</span>
          </div>

          {/* Purchase Task */}
          <div
            onClick={() => {
              handleClick("purchase");
              handlePurchaseClick();
            }}
            className={`flex items-center justify-between px-[3vw] py-[4.2vw] border-2 rounded-xl cursor-pointer border-[#07494E] bg-white ${
              !isEmailRegistered ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-5 h-5 rounded-full border-2 border-[#07494E] flex items-center justify-center ${
                  clickedTasks.purchase ? "bg-[#07494E]" : "bg-transparent"
                }`}
              ></div>
              <span className="text-[#07494E] font-medium">
                Purchase a 12-PACK TRIO
              </span>
            </div>
            <span className="text-[#07494E] font-bold text-[5vw]">+40 pt</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Options;
