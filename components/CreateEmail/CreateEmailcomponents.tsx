"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/components/Supabase/supabaseClient";

const CreateEmailcomponents = () => {
  const [email, setEmail] = useState("");
  const [worldID, setWorldID] = useState(""); // Assuming you have the worldID token from some authentication source
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Check if the world_id exists
      const { data: existingEntry, error: fetchError } = await supabase
        .from("rewards")
        .select("*")
        .eq("world_id", worldID)
        .single();

      if (fetchError) {
        setMessage("Error checking world ID in Supabase.");
        return;
      }

      if (existingEntry) {
        // If world_id exists, update the row with the provided email
        const { error: updateError } = await supabase
          .from("rewards")
          .update({ email })
          .eq("world_id", worldID);

        if (updateError) {
          setMessage("Error updating email in Supabase.");
        } else {
          setMessage("Email added to your rewards successfully!");
          router.push("/"); // Redirect to the home page or success page
        }
      } else {
        // Optional: If world_id does not exist, insert a new record with email and world_id
        const { error: insertError } = await supabase
          .from("rewards")
          .insert([{ world_id: worldID, email, points: 1 }]); // Default reward points

        if (insertError) {
          setMessage("Error inserting new reward entry.");
        } else {
          setMessage("New reward entry created with email and points!");
          router.push("/"); // Redirect to the home page or success page
        }
      }
    } catch (error) {
      setMessage("An unexpected error occurred.");
    }
  };

  return (
    <div className="text-black">
      <h2>Enter Your Email to Redeem Points</h2>
      <form onSubmit={handleEmailSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Redeem Points</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default CreateEmailcomponents;
