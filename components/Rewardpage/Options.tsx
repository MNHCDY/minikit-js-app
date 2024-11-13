"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import supabase from "../Supabase/supabaseClient";
import { useSession } from "next-auth/react";
import { TwitterApi } from "twitter-api-v2";

type TaskType = "email" | "worldID" | "twitter" | "purchase";

const Options = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isEmailRegistered, setIsEmailRegistered] = useState(false);
  const [isCheckingPurchase, setIsCheckingPurchase] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState<string | null>(null);
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
    // window.open("https://x.com/mnhcdy", "_blank");
  };

  const handleCallback = async () => {
    try {
      const response = await fetch("/api/twitter/callback", {
        method: "GET",
      });

      if (!response.ok) {
        const data = await response.json();
        setTooltipMessage(data.error); // Set the tooltip message
        return;
      }
      console.log(tooltipMessage);
      setTooltipMessage(null);
    } catch (error) {
      setTooltipMessage("An unexpected error occurred. Please try again.");
    }
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
    const userId = session?.user?.name;

    setIsCheckingPurchase(true); // Set loading state

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
        setIsCheckingPurchase(false);
        return;
      }

      if (data?.purchase_completed) {
        clearInterval(interval);
        await updatePoints(40);
        setClickedTasks((prev) => ({ ...prev, purchase: true }));
        console.log("Purchase detected and points updated.");
        setIsCheckingPurchase(false); // Reset loading state
      } else if (retries >= maxRetries) {
        clearInterval(interval);
        console.log("Purchase not detected within the timeout period.");
        setIsCheckingPurchase(false); // Reset loading state
      }
    }, 5000);
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
              handleFollow();
              handleClick("twitter");
              handleCallback();
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
          {tooltipMessage && (
            <div className="absolute bg-red-100 text-red-800 p-2 rounded-md text-sm border border-red-300 mt-2 z-50">
              {tooltipMessage}
            </div>
          )}

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
