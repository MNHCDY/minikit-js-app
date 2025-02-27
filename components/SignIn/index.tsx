"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import supabase from "../Supabase/supabaseClient";
import { useSession } from "next-auth/react";
import "react-toastify/dist/ReactToastify.css";
import { MdOutlineEmail } from "react-icons/md";
import { IoCartOutline } from "react-icons/io5";
import { useFooterContext } from "@/app/hooks/FooterContext";
import ReactDOM from "react-dom";
import { initWeb3Auth, getWalletAddress } from "../../app/lib/web3auth";

type TaskType = "email" | "worldID" | "purchase";

const Footer = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isEmailRegistered, setIsEmailRegistered] = useState(false);
  const [clickedTasks, setClickedTasks] = useState<{
    email: boolean;
    purchase: boolean;
  }>({
    email: false,
    purchase: false,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { hideFooter } = useFooterContext();

  useEffect(() => {
    const fetchTaskCompletionStatus = async () => {
      try {
        const web3auth = await initWeb3Auth();
        const provider = await web3auth.connect();
        if (!provider) {
          throw new Error("Wallet is not connected.");
        }

        const userInfo = await web3auth.getUserInfo();
        console.log("User Info:", userInfo);

        const verifierId = userInfo?.verifierId || null;

        if (!verifierId) return;

        const { data, error } = await supabase
          .from("users")
          .select("email, purchase_completed")
          .eq("verifier_id", verifierId)
          .single();

        if (error) throw error;

        if (data) {
          setClickedTasks({
            email: !!data.email, // Set to true if email exists
            purchase: data.purchase_completed,
          });
          setIsEmailRegistered(!!data.email);
        }
      } catch (error) {
        console.error(
          "Error fetching task completion status:",
          (error as Error).message
        );
      }
    };

    fetchTaskCompletionStatus();
  }, []);

  const handleClick = async (task: TaskType) => {
    if (!isEmailRegistered && task !== "email") return;

    const updatedClickedTasks = { ...clickedTasks, [task]: true };
    setClickedTasks(updatedClickedTasks);

    try {
      const web3auth = await initWeb3Auth();
      const provider = await web3auth.connect();
      if (!provider) {
        throw new Error("Wallet is not connected.");
      }

      const userInfo = await web3auth.getUserInfo();
      const verifierId = userInfo?.verifierId || null;
      if (!verifierId) return;

      const updateData: Record<string, any> = {
        purchase_completed: updatedClickedTasks.purchase,
      };

      if (updatedClickedTasks.email) updateData.email = userInfo?.email;

      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("verifier_id", verifierId);

      if (error) throw error;

      if (task === "email") {
        setIsEmailRegistered(true);
      }

      if (task === "purchase") {
        setIsModalOpen(true);
        return;
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

  const handleConfirmPurchase = async () => {
    setIsModalOpen(false);

    try {
      const web3auth = await initWeb3Auth();
      const provider = await web3auth.connect();
      if (!provider) {
        throw new Error("Wallet is not connected.");
      }

      const userInfo = await web3auth.getUserInfo();
      const verifierId = userInfo?.verifierId || null;
      if (!verifierId) return;

      const { error } = await supabase
        .from("users")
        .update({ purchase_completed: true })
        .eq("verifier_id", verifierId);

      if (error) throw error;

      router.push("/purchase-flojo");
    } catch (error) {
      console.error("Error updating purchase task:", error);
    }
  };

  return (
    <div
      className={`fixed bottom-0 left-0 w-full bg-white z-20 transition-transform duration-300 ${
        hideFooter ? "translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="flex flex-col justify-items-center w-full text-white bg-[#07494E] ">
        <div>
          <div className="flex flex-row justify-center py-[1.5vh] gap-14 bg-transparent max-w-md mx-auto text-xs">
            {/* Email Task */}
            <div
              onClick={() => handleClick("email")}
              className="flex flex-col items-center justify-between border-2 rounded-xl cursor-pointer border-[#07494E]"
            >
              <div className="flex flex-col items-center space-y-2">
                <div
                  className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center ${
                    clickedTasks.email
                      ? "bg-[#07494E] text-white"
                      : "bg-white text-[#07494E]"
                  }`}
                >
                  <span className="font-bold text-xl">
                    <MdOutlineEmail />
                  </span>
                </div>
                <span className="font-normal">Connect email</span>
              </div>
            </div>
            {/* Purchase Task */}
            <div
              onClick={() => handleClick("purchase")}
              className="flex flex-col items-center justify-between border-2 rounded-xl cursor-pointer border-[#07494E]"
            >
              <div className="flex flex-col items-center space-y-2">
                <div
                  className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center ${
                    clickedTasks.purchase
                      ? "bg-[#07494E] text-white"
                      : "bg-white text-[#07494E]"
                  }`}
                >
                  <span className="font-bold text-xl ">
                    <IoCartOutline />
                  </span>
                </div>
                <span className="font-medium">Purchase Flojo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
