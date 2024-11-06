"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/components/Supabase/supabaseClient";

const page = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Check if email already exists
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .eq("email", email)
        .single();

      if (data) {
        setMessage("Email already exists!");
      } else if (error) {
        // If email doesn't exist, insert it with default points
        const { error: insertError } = await supabase
          .from("rewards")
          .insert([{ email, points: 1 }]); // Default reward points

        if (insertError) {
          setMessage("Error inserting email.");
        } else {
          setMessage("Email registered successfully with 10 points!");
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

export default page;
