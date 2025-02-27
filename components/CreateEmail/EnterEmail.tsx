"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/components/Supabase/supabaseClient";
import { useSession } from "next-auth/react";
import { FaArrowLeft } from "react-icons/fa6";

declare module "next-auth" {
  interface Session {
    user: {
      email?: string | null;
      name?: string | null;
    };
  }
}

const EnterEmail = () => {
  const [email, setEmail] = useState("");
  const [verifierID, setVerifierID] = useState(""); // Updated from worldID
  const [message, setMessage] = useState("");
  const router = useRouter();

  const goToAnotherPage = () => {
    router.push("/landing-page");
  };

  const { data: session } = useSession();

  // Set the verifierID when the session changes
  useEffect(() => {
    if (session) {
      setVerifierID(session.user?.name || ""); // Set verifierID if session exists
    }
  }, [session]); // Only run when session changes

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Check if the verifier_id already exists in the "users" table
      const { data: existingEntry, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("verifier_id", verifierID) // Updated column name
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        setMessage("Error checking verifier ID in Supabase.");
        return;
      }

      if (existingEntry) {
        // If an entry with the verifier_id exists, update it
        const { error: updateError } = await supabase
          .from("users")
          .update({ email })
          .eq("verifier_id", verifierID); // Updated column name

        if (updateError) {
          setMessage("Already exists!");
        } else {
          setMessage("Email accepted, your rewards are added successfully!");
          router.push("/landing-page"); // Redirect to the reward page
        }
      } else {
        // If verifier_id does not exist, insert a new entry with email and verifier_id
        const { error: insertError } = await supabase
          .from("users")
          .insert([{ verifier_id: verifierID, email, points: 1 }]); // Updated column name

        if (insertError) {
          if (insertError.code === "23505") {
            setMessage("Entry already exists with this verifier ID.");
          } else {
            setMessage("Error inserting new reward entry.");
          }
        } else {
          setMessage("New reward entry created with email and points!");
          router.push("/landing-page"); // Redirect to the reward page
        }
      }
    } catch (error) {
      setMessage("An unexpected error occurred.");
    }
  };

  return (
    <div className="flex flex-col justify-items-center w-full text-[#07494E] gap-[8vw] p-[5vw]">
      <div className=" flex flex-col gap-[4vw]">
        <div>
          <button
            onClick={goToAnotherPage}
            className="text-4xl font-extralight"
          >
            <FaArrowLeft />
          </button>
        </div>
        <div className="p-[4vw] bg-white/40 backdrop-blur-sm mr-[1vw] rounded-xl flex flex-col gap-[5vw]">
          <div className="flex justify-between items-end">
            <h1 className="text-4xl font-bold leading-[10vw] ">
              Enter your email <br />
            </h1>
            <div className="text-[2.5vw] font-bold text-white pb-[1.5vw] ">
              <p className="bg-[#07494E] rounded-xl  px-[2vw] py-[0.5vw]">
                +1pt
              </p>
            </div>
          </div>
          <p className="text-[5vw] font-normal leading-[6vw]">
            Please use the same email to check out so we know where to send the
            the rewards to
          </p>
        </div>
      </div>
      <div>
        <form
          onSubmit={handleEmailSubmit}
          className="flex flex-col justify-center items-center gap-[10vw]"
        >
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-[3vw] py-[4.2vw] border-2 rounded-xl border-[#07494E] bg-white text-[#07494E] font-medium text-[5vw] focus:outline-none focus:border-[#07494E] w-full"
          />
          <button
            type="submit"
            className="bg-[#07494E] font-medium text-[5vw] text-white text py-[4vw] px-[15vw] rounded-xl uppercase"
          >
            Next
          </button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default EnterEmail;
