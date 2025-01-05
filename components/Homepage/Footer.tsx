"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import supabase from "../Supabase/supabaseClient";
import { useSession } from "next-auth/react";
import "react-toastify/dist/ReactToastify.css";
import { MdOutlineEmail } from "react-icons/md";
import { IoCartOutline } from "react-icons/io5";

type TaskType = "email" | "worldID" | "twitter" | "purchase";

const Footer = () => {
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

  const [isModalOpen, setIsModalOpen] = useState(false);

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

      if (task === "purchase") {
        setIsModalOpen(true); // Open the modal
        return;
      }

      switch (task) {
        case "email":
          router.push("/enter-email");
          break;
        // case "twitter":
        //   router.push("/follow-x");
        //   break;
        // case "purchase":
        //   router.push("/purchase-flojo");
        //   break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error updating task completion in Supabase:", error);
    }
  };

  const handleConfirmPurchase = async () => {
    setIsModalOpen(false);

    try {
      const worldId = session?.user?.name;

      const { error } = await supabase
        .from("users")
        .update({ purchase_completed: true })
        .eq("world_id", worldId);

      if (error) throw error;

      router.push("/purchase-flojo");
    } catch (error) {
      console.error("Error updating purchase task:", error);
    }
  };

  return (
    <div className="flex flex-col justify-items-center w-full text-white bg-[#07494E] ">
      <div>
        <div className="flex flex-row justify-center py-[3vw]  px-[7vw]  gap-[15vw] bg-transparent max-w-md mx-auto text-[2.5vw]">
          {/* Email Task */}
          <div
            onClick={() => handleClick("email")}
            className="flex flex-col items-center justify-between  border-2 rounded-xl cursor-pointer border-[#07494E]  "
          >
            <div className="flex flex-col items-center space-y-2">
              <div
                className={`w-[12vw] h-[12vw] rounded-full border-2 border-white flex items-center justify-center ${
                  clickedTasks.email
                    ? "bg-[#07494E] text-white"
                    : "bg-white text-[#07494E]"
                }`}
              >
                <span className=" font-bold text-[7vw]">
                  <MdOutlineEmail />
                </span>
              </div>
              <span className=" font-normal">Connect email</span>
            </div>
          </div>
          {/* Purchase Task */}
          <div
            onClick={() => {
              handleClick("purchase");
            }}
            className={`flex flex-col items-center justify-between  border-2 rounded-xl cursor-pointer border-[#07494E] ${
              !isEmailRegistered ? "opacity-50 cursor-not-allowed" : ""
            }
              `}
          >
            <div className="flex flex-col items-center space-y-2">
              <div
                className={`w-[12vw] h-[12vw] rounded-full border-2 border-white flex items-center justify-center ${
                  clickedTasks.purchase
                    ? "bg-[#07494E] text-white"
                    : "bg-white text-[#07494E]"
                }`}
              >
                <span className=" font-bold text-[8vw] ">
                  <IoCartOutline />
                </span>
              </div>
              <span className=" font-medium">Purchase Flojo</span>
            </div>
          </div>
          {/* Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white text-black p-6 rounded-lg shadow-lg mx-4">
                <h2 className="text-lg font-bold mb-4">
                  Are you from Singapore?
                </h2>
                <p className="text-sm mb-6">
                  We currently do not ship outside of Singapore. Please follow
                  our socials for the latest news.
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-300 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmPurchase}
                    className="px-4 py-2 bg-[#07494E] text-white rounded-md"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Footer;
