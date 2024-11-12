"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import supabase from "../Supabase/supabaseClient";
import { useSession } from "next-auth/react";

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
      const updateData = {
        email_completed: updatedClickedTasks.email,
        twitter_completed: updatedClickedTasks.twitter,
        purchase_completed: updatedClickedTasks.purchase,
      };

      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("world_id", worldId);

      if (error) throw error;

      if (task === "email") {
        setIsEmailRegistered(true);
      }

      if (task === "twitter") {
        window.open("https://x.com/drinkflojo", "_blank");
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
            onClick={() => handleClick("twitter")}
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
            onClick={() => handleClick("purchase")}
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
