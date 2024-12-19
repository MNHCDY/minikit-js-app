"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/components/Supabase/supabaseClient";
import { useSession } from "next-auth/react";
import { FaArrowLeft } from "react-icons/fa6";
import { toast } from "react-toastify";

declare module "next-auth" {
  interface Session {
    user: {
      email?: string | null;
      name?: string | null;
    };
  }
}

const EnterTwitter = () => {
  const [twitterHandle, settwitterHandle] = useState("");
  const [worldID, setWorldID] = useState(""); // Assuming you have the worldID token from some authentication source
  const [message, setMessage] = useState("");
  const router = useRouter();
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [points, setPoints] = useState<any | null>(null);

  const goToAnotherPage = () => {
    router.push("/landing-page");
  };

  const { data: session } = useSession();

  // Set the worldID when the session changes
  useEffect(() => {
    if (session) {
      setWorldID(session.user?.name || ""); // Set worldID if session exists
    }
  }, [session]); // Only run when session changes

  const checkTheFollower = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/checkFollower", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ twitterHandle }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(
          data.isFollowing
            ? `${twitterHandle} follows you!`
            : `${twitterHandle} does not follow you.`
        );
      } else {
        setError(data.error || "An error occurred");
      }
    } catch (err) {
      setError("Failed to check follower status.");
    }
  };

  const isValidTwitterHandle = (handle: string) =>
    /^@[a-zA-Z0-9_]{1,15}$/.test(handle);

  const handleTwitterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidTwitterHandle(twitterHandle)) {
      setMessage("Invalid Twitter handle.");
      return;
    }

    try {
      // Check if the world_id already exists in the "users" table
      const { data: existingEntry, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("world_id", worldID)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Supabase Fetch Error:", fetchError);
        setMessage("Error checking world ID in Supabase.");
        return;
      }

      if (existingEntry) {
        // window.location.href = `/api/twitter/oauth`;
        // If an entry with the world_id exists, update it
        const { error: updateError } = await supabase
          .from("users")
          .update({ twitter_id: `${twitterHandle}` })
          .eq("world_id", worldID);

        if (updateError) {
          setMessage("already exists!");
        } else {
          setMessage("processing further!");
          await checkTheFollower(e);
          const { data } = await supabase
            .from("users")
            .select("points")
            .eq("world_id", worldID);

          setPoints(data);
          const { error: updateError } = await supabase
            .from("users")
            .update({ purchase_completed: true, points: `${points + 25}` })
            .eq("world_id", worldID);

          if (updateError) {
            setError("already rewarded");
          }
        }
      }
    } catch (error) {
      setMessage("An unexpected error occurred.");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("success"))
      toast.success("Twitter linked successfully! Points updated.");
    if (params.has("error")) {
      const error = params.get("error");
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
    <div className="flex flex-col justify-items-center w-full text-[#07494E] gap-[8vw] p-[5vw]">
      <div className=" flex flex-col gap-[4vw]">
        <div>
          <button
            onClick={goToAnotherPage}
            className="text-[10vw] font-extralight"
          >
            <FaArrowLeft />
          </button>
        </div>
        <div className="p-[4vw] bg-white/40 backdrop-blur-sm mr-[1vw] rounded-xl flex flex-col gap-[5vw]">
          <div className="flex justify-between items-end">
            <h1 className="text-[8.5vw] font-bold leading-[10vw] ">
              Follow X. <br />
            </h1>
            <div className="text-[2.5vw] font-bold text-white pb-[1.5vw] ">
              <p className="bg-[#07494E] rounded-xl  px-[2vw] py-[0.5vw]">
                +25pt
              </p>
            </div>
          </div>
          <p className="text-[5vw] font-normal leading-[6vw]">
            Follow @drinkflojo to get the latest updates on our launch.
          </p>
        </div>
      </div>
      <div>
        <form
          onSubmit={handleTwitterSubmit}
          className="flex flex-col justify-center items-center gap-[10vw]"
        >
          <input
            type="text"
            placeholder="Enter your X handle"
            value={twitterHandle}
            onChange={(e) => settwitterHandle(e.target.value)}
            required
            className="px-[3vw] py-[4.2vw] border-2 rounded-xl border-[#07494E] bg-white text-[#07494E] font-medium text-[5vw] focus:outline-none focus:border-[#07494E] w-full"
          />
          <button
            type="submit"
            className="bg-[#07494E] font-medium text-[5vw] text-white text py-[4vw] px-[15vw] rounded-xl uppercase"
          >
            Confirm
          </button>
        </form>
        {message && <p>{message}</p>}
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default EnterTwitter;
