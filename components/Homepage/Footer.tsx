"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import supabase from "../Supabase/supabaseClient";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type TaskType = "email" | "worldID" | "twitter" | "purchase";

const Footer = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isEmailRegistered, setIsEmailRegistered] = useState(false);
  const [isCheckingPurchase, setIsCheckingPurchase] = useState(false);
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

  // for toast the errors

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const error = params.get("error");

    if (success) {
      toast.success("Twitter linked successfully! Points updated.");
    }

    if (error) {
      switch (error) {
        case "unauthorized":
          toast.error("You must be logged in.");
          break;
        case "invalid_callback":
          toast.error("Invalid OAuth callback request.");
          break;
        case "no_screen_name":
          toast.error("Failed to retrieve Twitter username.");
          break;
        case "no_world_id":
          toast.error("Session error: World ID not found.");
          break;
        case "fetch_error":
          toast.error("Error fetching user data.");
          break;
        case "check_error":
          toast.error("Error checking existing Twitter account.");
          break;
        case "update_error":
          toast.error("Error updating user data.");
          break;
        case "traffic_high":
          toast.warn("Traffic too high. Please try again later.");
          break;
        case "callback_error":
        default:
          toast.error("An error occurred. Please try again.");
      }
    }
  }, []);

  return (
    <div className="flex flex-col justify-items-center w-full text-white bg-[#07494E] ">
      <div>
        <div className="flex flex-row justify-between py-[3vw]  px-[7vw] bg-transparent max-w-md mx-auto text-[2.5vw]">
          {/* Email Task */}
          <div
            onClick={() => handleClick("email")}
            className="flex flex-col items-center justify-between  border-2 rounded-xl cursor-pointer border-[#07494E]  "
          >
            <div className="flex flex-col items-center space-y-2">
              <div
                className={`w-[12vw] h-[12vw] rounded-full border-2 border-white flex items-center justify-center ${
                  clickedTasks.email ? "bg-[#07494E]" : "bg-white"
                }`}
              >
                <span className=" font-bold text-[3vw] text-[#07494E]">
                  +1 pt
                </span>
              </div>
              <span className=" font-normal">Connect email</span>
            </div>
          </div>

          {/* Twitter Task */}
          <div
            onClick={() => {
              handleFollow();
              handleClick("twitter");
            }}
            className={`flex flex-col items-center justify-between  border-2 rounded-xl cursor-pointer border-[#07494E]  ${
              !isEmailRegistered ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <div className="flex flex-col items-center space-y-2">
              <div
                className={`w-[12vw] h-[12vw] rounded-full border-2 border-white flex items-center justify-center ${
                  clickedTasks.twitter ? "bg-[#07494E]" : "bg-white"
                }`}
              >
                <span className=" font-bold text-[3vw] text-[#07494E]">
                  +25 pt
                </span>
              </div>
              <span className=" font-medium">Follow Twitter</span>
            </div>
          </div>

          {/* Purchase Task */}
          <div
            onClick={() => {
              handleClick("purchase");
              handlePurchaseClick();
            }}
            className={`flex flex-col items-center justify-between  border-2 rounded-xl cursor-pointer border-[#07494E]  ${
              !isEmailRegistered ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <div className="flex flex-col items-center space-y-2">
              <div
                className={`w-[12vw] h-[12vw] rounded-full border-2 border-white flex items-center justify-center ${
                  clickedTasks.purchase ? "bg-[#07494E]" : "bg-white"
                }`}
              >
                <span className=" font-bold text-[3vw] text-[#07494E]">
                  +40 pt
                </span>
              </div>
              <span className=" font-medium">Purchase Flojo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
